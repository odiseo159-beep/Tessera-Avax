import { ethers, network } from "hardhat";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface FujiDeployment {
  network: string;
  chainId: number;
  deployedAt: string;
  deployer: string;
  contracts: {
    mockUsdc: string;
    identityRegistry: string;
    orderbook: string;
    securityTokens: Record<"KVK" | "BTS" | "CLP" | "ARK1", string>;
  };
  config: { lockupEnd: number; totalSupplyPerToken: string; feeBps: number };
}

interface TestWalletRecord {
  index: number;
  address: string;
  privateKey: string;
}

interface TestWalletsFile {
  network: string;
  createdAt: string;
  wallets: TestWalletRecord[];
}

const USDC_UNIT = 10n ** 6n;
const TOKEN_UNIT = 10n ** 18n;

// Per test wallet
const AVAX_PER_WALLET = ethers.parseEther("0.4");
const USDC_PER_WALLET = 100_000n * USDC_UNIT; // 100k USDC
const TOKENS_PER_WALLET = ethers.parseEther("1000"); // 1k per SecurityToken

// Order layout per token, mid price ~ $10-$20 USDC. Each row places an order
// from a specific test wallet. With 3 wallets and 6 orders per token we get
// 24 total orders across the 4 SecurityTokens (24 * 4 = 96... wait, 6 per
// token * 4 tokens = 24 total). Distribute round-robin across wallets.
interface OrderTemplate {
  isBuy: boolean;
  amount: bigint; // SecurityToken units
  priceUsdc: bigint; // USDC base units (6 decimals)
}

function ordersForToken(midPrice: bigint): OrderTemplate[] {
  // Six orders per token: three bids below mid, three asks above mid.
  const bidOffsets = [-50n, -25n, -10n]; // cents below mid (price is in 1e6 base; 1c = 1e4)
  const askOffsets = [10n, 25n, 50n];
  const cent = 10_000n;
  const amounts = [
    ethers.parseEther("50"),
    ethers.parseEther("100"),
    ethers.parseEther("150"),
  ];
  const result: OrderTemplate[] = [];
  bidOffsets.forEach((off, i) => {
    result.push({ isBuy: true, amount: amounts[i], priceUsdc: midPrice + off * cent });
  });
  askOffsets.forEach((off, i) => {
    result.push({ isBuy: false, amount: amounts[i], priceUsdc: midPrice + off * cent });
  });
  return result;
}

const MID_PRICES: Record<"KVK" | "BTS" | "CLP" | "ARK1", bigint> = {
  KVK: 18n * USDC_UNIT, // $18
  BTS: 14n * USDC_UNIT, // $14
  CLP: 11n * USDC_UNIT, // $11
  ARK1: 20n * USDC_UNIT, // $20
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const deploymentPath = join(__dirname, "..", "deployments", `${network.name}.json`);
  if (!existsSync(deploymentPath)) {
    throw new Error(
      `No deployment found at ${deploymentPath}. Run deploy.ts on ${network.name} first.`
    );
  }
  const deployment: FujiDeployment = JSON.parse(readFileSync(deploymentPath, "utf8"));
  console.log(`Network: ${network.name} (chainId ${network.config.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(
    `Deployer balance: ${ethers.formatEther(
      await ethers.provider.getBalance(deployer.address)
    )} AVAX\n`
  );

  const usdc = await ethers.getContractAt("MockUSDC", deployment.contracts.mockUsdc);
  const registry = await ethers.getContractAt(
    "IdentityRegistry",
    deployment.contracts.identityRegistry
  );
  const orderbook = await ethers.getContractAt(
    "Orderbook",
    deployment.contracts.orderbook
  );
  const tokenAddresses = deployment.contracts.securityTokens;
  const tokens = {
    KVK: await ethers.getContractAt("SecurityToken", tokenAddresses.KVK),
    BTS: await ethers.getContractAt("SecurityToken", tokenAddresses.BTS),
    CLP: await ethers.getContractAt("SecurityToken", tokenAddresses.CLP),
    ARK1: await ethers.getContractAt("SecurityToken", tokenAddresses.ARK1),
  };

  // 1. Generate and persist three random test wallets
  console.log("Generating 3 test wallets...");
  const testWallets = Array.from({ length: 3 }, (_, i) => {
    const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
    console.log(`  wallet[${i}] = ${wallet.address}`);
    return wallet;
  });

  const walletsFile: TestWalletsFile = {
    network: network.name,
    createdAt: new Date().toISOString(),
    wallets: testWallets.map((w, i) => ({
      index: i,
      address: w.address,
      privateKey: w.privateKey,
    })),
  };
  const walletsPath = join(__dirname, "..", "deployments", "test-wallets.json");
  mkdirSync(join(__dirname, "..", "deployments"), { recursive: true });
  writeFileSync(walletsPath, JSON.stringify(walletsFile, null, 2) + "\n");
  console.log(`Saved private keys to ${walletsPath} (gitignored)\n`);

  // 2. Fund each test wallet with AVAX
  console.log(`Funding each wallet with ${ethers.formatEther(AVAX_PER_WALLET)} AVAX...`);
  for (const wallet of testWallets) {
    const tx = await deployer.sendTransaction({
      to: wallet.address,
      value: AVAX_PER_WALLET,
    });
    await tx.wait();
    console.log(`  -> ${wallet.address} funded (${tx.hash})`);
  }
  console.log();

  // 3. Verify each test wallet in IdentityRegistry (deployer is claimIssuer)
  console.log("Verifying test wallets in IdentityRegistry...");
  for (const wallet of testWallets) {
    const already = await registry.isVerified(wallet.address);
    if (already) {
      console.log(`  -> ${wallet.address} already verified, skipping`);
      continue;
    }
    const tx = await registry.connect(deployer).addIdentity(wallet.address, "MX");
    await tx.wait();
    console.log(`  -> verified ${wallet.address}`);
  }
  console.log();

  // 4. Mint USDC and distribute SecurityTokens
  console.log(`Minting ${USDC_PER_WALLET / USDC_UNIT} USDC to each test wallet...`);
  for (const wallet of testWallets) {
    const tx = await usdc.connect(deployer).mint(wallet.address, USDC_PER_WALLET);
    await tx.wait();
  }
  console.log();

  console.log(
    `Transferring ${ethers.formatEther(TOKENS_PER_WALLET)} of each SecurityToken to each test wallet...`
  );
  for (const [symbol, token] of Object.entries(tokens) as [
    keyof typeof tokens,
    (typeof tokens)[keyof typeof tokens]
  ][]) {
    for (const wallet of testWallets) {
      const tx = await token.connect(deployer).transfer(wallet.address, TOKENS_PER_WALLET);
      await tx.wait();
    }
    console.log(`  -> ${symbol} distributed`);
  }
  console.log();

  // 5. Approve orderbook from each test wallet for USDC and every SecurityToken
  const orderbookAddress = deployment.contracts.orderbook;
  console.log("Approving orderbook from every test wallet...");
  for (const wallet of testWallets) {
    const txUsdc = await usdc
      .connect(wallet)
      .approve(orderbookAddress, ethers.MaxUint256);
    await txUsdc.wait();
    for (const token of Object.values(tokens)) {
      const tx = await token.connect(wallet).approve(orderbookAddress, ethers.MaxUint256);
      await tx.wait();
    }
    console.log(`  -> ${wallet.address} approved USDC + 4 tokens`);
  }
  console.log();

  // 6. Place 6 orders per token (3 bids + 3 asks), round-robin across wallets
  console.log("Placing seed orders (6 per token = 24 total)...");
  let totalPlaced = 0;
  for (const symbol of Object.keys(tokens) as (keyof typeof tokens)[]) {
    const token = tokens[symbol];
    const templates = ordersForToken(MID_PRICES[symbol]);
    for (let i = 0; i < templates.length; i++) {
      const wallet = testWallets[i % testWallets.length];
      const tpl = templates[i];
      const tx = await orderbook
        .connect(wallet)
        .placeOrder(await token.getAddress(), tpl.isBuy, tpl.amount, tpl.priceUsdc);
      const receipt = await tx.wait();
      totalPlaced += 1;
      console.log(
        `  ${symbol} ${tpl.isBuy ? "BUY " : "SELL"} ${ethers.formatEther(
          tpl.amount
        )} @ ${Number(tpl.priceUsdc) / Number(USDC_UNIT)} USDC by ${wallet.address.slice(
          0,
          10
        )}... (block ${receipt!.blockNumber})`
      );
    }
  }
  console.log(`\nPlaced ${totalPlaced} orders total.`);

  // 7. Summary
  const nextId = await orderbook.nextOrderId();
  const sample = await orderbook.getOrder(0);
  console.log(`\nOrderbook nextOrderId = ${nextId}`);
  console.log(`Sample getOrder(0):`);
  console.log(`  id     = ${sample.id}`);
  console.log(`  maker  = ${sample.maker}`);
  console.log(`  token  = ${sample.token}`);
  console.log(`  isBuy  = ${sample.isBuy}`);
  console.log(`  amount = ${ethers.formatEther(sample.amount)} tokens`);
  console.log(`  price  = ${Number(sample.price) / Number(USDC_UNIT)} USDC`);
  console.log(`  active = ${sample.active}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
