import { ethers, network } from "hardhat";
import { existsSync, readFileSync } from "fs";
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
}

const USDC_UNIT = 10n ** 6n;
const TOKEN_UNIT = 10n ** 18n;

interface OrderTemplate {
  isBuy: boolean;
  amount: bigint;
  priceUsdc: bigint;
}

function ordersForToken(midPrice: bigint): OrderTemplate[] {
  const cent = 10_000n;
  const bidOffsets = [-50n, -25n, -10n];
  const askOffsets = [10n, 25n, 50n];
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
  KVK: 18n * USDC_UNIT,
  BTS: 14n * USDC_UNIT,
  CLP: 11n * USDC_UNIT,
  ARK1: 20n * USDC_UNIT,
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
  console.log(`Maker (deployer): ${deployer.address}`);
  console.log(
    `Balance: ${ethers.formatEther(
      await ethers.provider.getBalance(deployer.address)
    )} AVAX\n`
  );

  const usdc = await ethers.getContractAt("MockUSDC", deployment.contracts.mockUsdc);
  const orderbook = await ethers.getContractAt(
    "Orderbook",
    deployment.contracts.orderbook
  );
  const tokens = {
    KVK: await ethers.getContractAt("SecurityToken", deployment.contracts.securityTokens.KVK),
    BTS: await ethers.getContractAt("SecurityToken", deployment.contracts.securityTokens.BTS),
    CLP: await ethers.getContractAt("SecurityToken", deployment.contracts.securityTokens.CLP),
    ARK1: await ethers.getContractAt("SecurityToken", deployment.contracts.securityTokens.ARK1),
  };
  const orderbookAddress = deployment.contracts.orderbook;

  // 1. Mint USDC for buy-side escrow. Generous budget so all 12 buy orders fit.
  const usdcMint = 1_000_000n * USDC_UNIT; // 1M USDC
  console.log(`Minting ${usdcMint / USDC_UNIT} USDC to deployer...`);
  await (await usdc.mint(deployer.address, usdcMint)).wait();

  // 2. Approve orderbook from deployer for USDC and every SecurityToken.
  console.log("Approving orderbook for USDC + 4 SecurityTokens...");
  await (await usdc.approve(orderbookAddress, ethers.MaxUint256)).wait();
  for (const [symbol, token] of Object.entries(tokens) as [
    keyof typeof tokens,
    (typeof tokens)[keyof typeof tokens]
  ][]) {
    await (await token.approve(orderbookAddress, ethers.MaxUint256)).wait();
    console.log(`  ${symbol} approved`);
  }
  console.log();

  // 3. Place 6 orders per token (3 bids + 3 asks), all from the deployer.
  console.log("Placing seed orders (6 per token = 24 total)...");
  let totalPlaced = 0;
  for (const symbol of Object.keys(tokens) as (keyof typeof tokens)[]) {
    const token = tokens[symbol];
    const templates = ordersForToken(MID_PRICES[symbol]);
    for (const tpl of templates) {
      const tx = await orderbook.placeOrder(
        await token.getAddress(),
        tpl.isBuy,
        tpl.amount,
        tpl.priceUsdc
      );
      await tx.wait();
      totalPlaced += 1;
      console.log(
        `  ${symbol} ${tpl.isBuy ? "BUY " : "SELL"} ${ethers.formatEther(
          tpl.amount
        )} @ ${Number(tpl.priceUsdc) / Number(USDC_UNIT)} USDC`
      );
    }
  }

  // 4. Summary
  const nextId = await orderbook.nextOrderId();
  const sample = await orderbook.getOrder(0);
  console.log(`\nPlaced ${totalPlaced} orders. nextOrderId = ${nextId}`);
  console.log(`Sample getOrder(0):`);
  console.log(`  id     = ${sample.id}`);
  console.log(`  maker  = ${sample.maker}`);
  console.log(`  token  = ${sample.token}`);
  console.log(`  isBuy  = ${sample.isBuy}`);
  console.log(`  amount = ${ethers.formatEther(sample.amount)} tokens`);
  console.log(`  price  = ${Number(sample.price) / Number(USDC_UNIT)} USDC`);
  console.log(`  active = ${sample.active}`);

  const balanceAfter = await ethers.provider.getBalance(deployer.address);
  console.log(`\nDeployer balance after seed: ${ethers.formatEther(balanceAfter)} AVAX`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
