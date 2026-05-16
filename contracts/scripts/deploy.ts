import { ethers, network } from "hardhat";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

interface SecurityTokenSpec {
  symbol: "KVK" | "BTS" | "CLP" | "ARK1";
  name: string;
  companyName: string;
  sector: string;
  vintageRound: string;
}

interface FujiDeployment {
  network: string;
  chainId: number;
  deployedAt: string;
  deployer: string;
  contracts: {
    mockUsdc: string;
    identityRegistry: string;
    orderbook: string;
    securityTokens: Record<SecurityTokenSpec["symbol"], string>;
  };
  config: {
    lockupEnd: number;
    totalSupplyPerToken: string;
    feeBps: number;
  };
}

const TOKEN_SPECS: SecurityTokenSpec[] = [
  {
    symbol: "KVK",
    name: "Kavak Premium",
    companyName: "Kavak Premium",
    sector: "Mobility",
    vintageRound: "Serie D",
  },
  {
    symbol: "BTS",
    name: "Bitso",
    companyName: "Bitso",
    sector: "Fintech",
    vintageRound: "Serie C",
  },
  {
    symbol: "CLP",
    name: "Clip",
    companyName: "Clip",
    sector: "Payments",
    vintageRound: "Serie D",
  },
  {
    symbol: "ARK1",
    name: "Arkangeles Deal #1",
    companyName: "Arkangeles Deal #1",
    sector: "Venture Fund",
    vintageRound: "SPV",
  },
];

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log(`Network: ${network.name} (chainId ${network.config.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} AVAX\n`);

  // 1. MockUSDC
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log(`MockUSDC          -> ${usdcAddress}`);

  // 2. IdentityRegistry. Deployer is owner AND initial claim issuer; the API
  //    route in the web app uses the same wallet (KYC_ISSUER_PRIVATE_KEY) to
  //    sign claims.
  const Registry = await ethers.getContractFactory("IdentityRegistry");
  const registry = await Registry.deploy(deployer.address);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log(`IdentityRegistry  -> ${registryAddress}`);

  // 3. Four SecurityTokens. No lockup so the demo can trade immediately.
  const lockupEnd = 0;
  const totalSupply = ethers.parseEther("1000000"); // 1M tokens per company
  const tokenAddresses: Record<SecurityTokenSpec["symbol"], string> = {
    KVK: "",
    BTS: "",
    CLP: "",
    ARK1: "",
  };

  const SecurityToken = await ethers.getContractFactory("SecurityToken");
  for (const spec of TOKEN_SPECS) {
    const token = await SecurityToken.deploy(
      spec.name,
      spec.symbol,
      registryAddress,
      lockupEnd,
      totalSupply,
      spec.companyName,
      spec.sector,
      spec.vintageRound
    );
    await token.waitForDeployment();
    const address = await token.getAddress();
    tokenAddresses[spec.symbol] = address;
    console.log(`SecurityToken ${spec.symbol.padEnd(4)} -> ${address}`);
  }

  // 4. Orderbook
  const Orderbook = await ethers.getContractFactory("Orderbook");
  const orderbook = await Orderbook.deploy(usdcAddress, deployer.address);
  await orderbook.waitForDeployment();
  const orderbookAddress = await orderbook.getAddress();
  console.log(`Orderbook         -> ${orderbookAddress}`);

  // 5. Compliance: orderbook must be in IdentityRegistry to escrow tokens.
  console.log("\nVerifying orderbook in IdentityRegistry...");
  const tx = await registry.addIdentity(orderbookAddress, "");
  await tx.wait();
  console.log(`tx ${tx.hash}`);

  const deployment: FujiDeployment = {
    network: network.name,
    chainId: Number(network.config.chainId ?? 0),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      mockUsdc: usdcAddress,
      identityRegistry: registryAddress,
      orderbook: orderbookAddress,
      securityTokens: tokenAddresses,
    },
    config: {
      lockupEnd,
      totalSupplyPerToken: totalSupply.toString(),
      feeBps: 30,
    },
  };

  const dir = join(__dirname, "..", "deployments");
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `${network.name}.json`);
  writeFileSync(path, JSON.stringify(deployment, null, 2) + "\n");
  console.log(`\nDeployment saved to ${path}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
