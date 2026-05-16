import { ethers, network } from "hardhat";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

/// Deploys 6 SecurityTokens that mirror Dinari dShare tickers (AAPL, MSFT,
/// NVDA, GOOGL, AMZN, META) and seeds 4 orders per token (2 bids + 2 asks)
/// bracketed around real prices captured from Dinari sandbox.
///
/// Appends the new addresses to deployments/<network>.json under
/// `contracts.publicTokens` without touching the existing private tokens.

interface PublicSpec {
  symbol: "AAPL" | "MSFT" | "NVDA" | "GOOGL" | "AMZN" | "META";
  name: string;
  sector: string;
  midPriceUsdc: number; // dollars (will be converted to base units)
}

const PUBLIC_SPECS: PublicSpec[] = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Hardware", midPriceUsdc: 299.85 },
  { symbol: "MSFT", name: "Microsoft", sector: "Software", midPriceUsdc: 419.67 },
  { symbol: "NVDA", name: "NVIDIA", sector: "Semiconductors", midPriceUsdc: 224.41 },
  { symbol: "GOOGL", name: "Alphabet", sector: "Internet", midPriceUsdc: 395.28 },
  { symbol: "AMZN", name: "Amazon", sector: "E-commerce", midPriceUsdc: 262.59 },
  { symbol: "META", name: "Meta Platforms", sector: "Social Media", midPriceUsdc: 610.4 },
];

const USDC_UNIT = 10n ** 6n;
const TOKEN_UNIT = 10n ** 18n;

interface DeploymentFile {
  network: string;
  chainId: number;
  deployedAt: string;
  deployer: string;
  contracts: {
    mockUsdc: string;
    identityRegistry: string;
    orderbook: string;
    securityTokens: Record<string, string>;
    publicTokens?: Record<string, string>;
  };
  config: { lockupEnd: number; totalSupplyPerToken: string; feeBps: number };
}

function priceToBaseUnits(price: number): bigint {
  // Convert USD float -> 6-decimal base units, rounding to cent precision.
  return BigInt(Math.round(price * 1_000_000));
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const path = join(__dirname, "..", "deployments", `${network.name}.json`);
  if (!existsSync(path)) {
    throw new Error(`Run deploy.ts first; missing ${path}`);
  }
  const deployment: DeploymentFile = JSON.parse(readFileSync(path, "utf8"));

  console.log(`Network: ${network.name} (chainId ${network.config.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(
    `Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} AVAX\n`
  );

  const Registry = await ethers.getContractAt(
    "IdentityRegistry",
    deployment.contracts.identityRegistry
  );
  const Orderbook = await ethers.getContractAt(
    "Orderbook",
    deployment.contracts.orderbook
  );
  const orderbookAddress = deployment.contracts.orderbook;

  const SecurityToken = await ethers.getContractFactory("SecurityToken");
  const lockupEnd = 0;
  const totalSupply = ethers.parseEther("1000000");

  // 1. Deploy 6 SecurityTokens for the public universe.
  const publicTokens: Record<string, string> = deployment.contracts.publicTokens ?? {};

  for (const spec of PUBLIC_SPECS) {
    if (publicTokens[spec.symbol]) {
      console.log(`SecurityToken ${spec.symbol.padEnd(5)} -> reuse ${publicTokens[spec.symbol]}`);
      continue;
    }
    const token = await SecurityToken.deploy(
      `${spec.name} (Dinari)`,
      spec.symbol,
      deployment.contracts.identityRegistry,
      lockupEnd,
      totalSupply,
      spec.name,
      spec.sector,
      "NASDAQ"
    );
    await token.waitForDeployment();
    const addr = await token.getAddress();
    publicTokens[spec.symbol] = addr;
    console.log(`SecurityToken ${spec.symbol.padEnd(5)} -> ${addr}`);
  }

  // 2. Approve orderbook from deployer for each new token (deployer is the seed maker).
  console.log("\nApproving orderbook for the 6 new tokens...");
  for (const spec of PUBLIC_SPECS) {
    const token = await ethers.getContractAt("SecurityToken", publicTokens[spec.symbol]);
    const tx = await token.approve(orderbookAddress, ethers.MaxUint256);
    await tx.wait();
    console.log(`  ${spec.symbol} approved`);
  }

  // 3. Seed 4 orders per token (2 bids + 2 asks) bracketing the mid price.
  console.log("\nSeeding 4 orders per token (24 total)...");
  let placed = 0;
  for (const spec of PUBLIC_SPECS) {
    const tokenAddress = publicTokens[spec.symbol];
    const mid = priceToBaseUnits(spec.midPriceUsdc); // base units, 6 dec
    // Offsets in base units = $0.50 and $1.00 around mid.
    const offsets = [
      { isBuy: true, amount: ethers.parseEther("10"), offset: -100_000n }, // -$1.00
      { isBuy: true, amount: ethers.parseEther("5"), offset: -50_000n },  // -$0.50
      { isBuy: false, amount: ethers.parseEther("5"), offset: 50_000n },  // +$0.50
      { isBuy: false, amount: ethers.parseEther("10"), offset: 100_000n }, // +$1.00
    ];
    for (const o of offsets) {
      const price = mid + o.offset;
      const tx = await Orderbook.placeOrder(tokenAddress, o.isBuy, o.amount, price);
      await tx.wait();
      placed += 1;
      const dollars = (Number(price) / Number(USDC_UNIT)).toFixed(2);
      const qty = ethers.formatEther(o.amount);
      console.log(
        `  ${spec.symbol.padEnd(5)} ${o.isBuy ? "BUY " : "SELL"} ${qty.padStart(8)} @ $${dollars}`
      );
    }
  }
  console.log(`\nPlaced ${placed} new orders.`);

  // 4. Persist the updated deployment file.
  deployment.contracts.publicTokens = publicTokens;
  deployment.deployedAt = new Date().toISOString();
  writeFileSync(path, JSON.stringify(deployment, null, 2) + "\n");
  console.log(`\nUpdated ${path}`);

  const balanceAfter = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance after: ${ethers.formatEther(balanceAfter)} AVAX`);

  // Suppress unused warning — the registry handle is loaded so the script
  // fails loudly if the registry address in fuji.json is broken.
  void Registry;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
