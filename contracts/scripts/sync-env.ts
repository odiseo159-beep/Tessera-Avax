import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface FujiDeployment {
  network: string;
  chainId: number;
  contracts: {
    mockUsdc: string;
    identityRegistry: string;
    orderbook: string;
    securityTokens: Record<"KVK" | "BTS" | "CLP" | "ARK1", string>;
    publicTokens?: Record<"AAPL" | "MSFT" | "NVDA" | "GOOGL" | "AMZN" | "META", string>;
  };
}

const NETWORK = process.argv[2] ?? "fuji";

const RPC_URLS: Record<string, string> = {
  fuji: "https://api.avax-test.network/ext/bc/C/rpc",
  hardhat: "http://127.0.0.1:8545",
  localhost: "http://127.0.0.1:8545",
};

function readDeployerKey(): string | null {
  const envPath = join(__dirname, "..", ".env");
  if (!existsSync(envPath)) return null;
  const content = readFileSync(envPath, "utf8");
  const match = content.match(/^PRIVATE_KEY=(.+)$/m);
  return match ? match[1].trim() : null;
}

function applyUpdate(content: string, key: string, value: string): string {
  const regex = new RegExp(`^${key}=.*$`, "m");
  if (regex.test(content)) return content.replace(regex, `${key}=${value}`);
  if (content.length > 0 && !content.endsWith("\n")) content += "\n";
  return content + `${key}=${value}\n`;
}

function ensureKey(content: string, key: string, defaultValue: string): string {
  const regex = new RegExp(`^${key}=`, "m");
  if (regex.test(content)) return content;
  if (content.length > 0 && !content.endsWith("\n")) content += "\n";
  return content + `${key}=${defaultValue}\n`;
}

function main(): void {
  const deploymentPath = join(__dirname, "..", "deployments", `${NETWORK}.json`);
  if (!existsSync(deploymentPath)) {
    throw new Error(`No deployment file at ${deploymentPath}`);
  }
  const deployment: FujiDeployment = JSON.parse(readFileSync(deploymentPath, "utf8"));
  const envPath = join(__dirname, "..", "..", "web", ".env.local");
  let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";

  content = applyUpdate(content, "NEXT_PUBLIC_CHAIN_ID", String(deployment.chainId));
  content = applyUpdate(
    content,
    "NEXT_PUBLIC_RPC_URL",
    RPC_URLS[NETWORK] ?? "http://127.0.0.1:8545"
  );
  content = applyUpdate(content, "NEXT_PUBLIC_USDC_ADDRESS", deployment.contracts.mockUsdc);
  content = applyUpdate(
    content,
    "NEXT_PUBLIC_IDENTITY_REGISTRY",
    deployment.contracts.identityRegistry
  );
  content = applyUpdate(
    content,
    "NEXT_PUBLIC_ORDERBOOK_ADDRESS",
    deployment.contracts.orderbook
  );

  // Private universe
  for (const [sym, addr] of Object.entries(deployment.contracts.securityTokens)) {
    content = applyUpdate(content, `NEXT_PUBLIC_TOKEN_${sym}`, addr);
  }

  // Public universe (Dinari-style mirrors)
  for (const [sym, addr] of Object.entries(deployment.contracts.publicTokens ?? {})) {
    content = applyUpdate(content, `NEXT_PUBLIC_TOKEN_${sym}`, addr);
  }

  content = ensureKey(content, "NEXT_PUBLIC_WC_PROJECT_ID", "YOUR_WC_PROJECT_ID");

  // KYC issuer = deployer (per deploy.ts). Copy the private key over so the
  // /api/kyc/verify route can sign claims with the same address that owns the
  // IdentityRegistry.
  const deployerKey = readDeployerKey();
  if (deployerKey) {
    content = applyUpdate(content, "KYC_ISSUER_PRIVATE_KEY", deployerKey);
  } else {
    content = ensureKey(content, "KYC_ISSUER_PRIVATE_KEY", "");
  }

  writeFileSync(envPath, content);
  console.log(`Wrote ${envPath}.`);
}

main();
