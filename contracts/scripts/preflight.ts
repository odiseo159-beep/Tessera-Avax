/// Tessera preflight — run before any live demo to catch the obvious
/// failures *before* the audience watches: deployer wallet drained of
/// gas, USDC mint empty, KYC state unexpected, orderbook fills cleared
/// out, contract addresses pointing at nothing.
///
/// Run from contracts/: `pnpm preflight:fuji`
///
/// Exit codes: 0 = all green, 1 = one or more critical failures.

import { ethers } from "hardhat";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

interface FujiDeployment {
  network: string;
  chainId: number;
  deployer: string;
  contracts: {
    mockUsdc: string;
    identityRegistry: string;
    orderbook: string;
    securityTokens: Record<string, string>;
    publicTokens?: Record<string, string>;
  };
}

// Demo thresholds: tuned for a 2-min pitch where we need ~10 placeOrder
// txs of gas + plenty of USDC to fill a buy. Tighten if budget shrinks.
const MIN_AVAX = 0.05;
const MIN_USDC = 1000;
const MIN_ORDERS_PER_TOKEN = 4;

let warnings = 0;
let criticals = 0;

function pad(s: string, n: number): string {
  return s.length >= n ? s : s + " ".repeat(n - s.length);
}

function short(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function ok(msg: string): void {
  console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
}
function warn(msg: string): void {
  warnings += 1;
  console.log(`  \x1b[33m⚠\x1b[0m ${msg}`);
}
function fail(msg: string): void {
  criticals += 1;
  console.log(`  \x1b[31m✗\x1b[0m ${msg}`);
}
function section(title: string): void {
  console.log(`\n\x1b[1m▸ ${title}\x1b[0m`);
}

async function main(): Promise<void> {
  const deploymentPath = join(__dirname, "..", "deployments", "fuji.json");
  if (!existsSync(deploymentPath)) {
    console.error(`✗ Missing deployment file: ${deploymentPath}`);
    console.error(`  Run \`pnpm deploy:fuji\` first.`);
    process.exit(2);
  }
  const d: FujiDeployment = JSON.parse(readFileSync(deploymentPath, "utf8"));

  console.log(
    "\n\x1b[1mTessera preflight\x1b[0m · Avalanche Fuji (chainId 43113)",
  );
  console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  );

  // ── RPC ────────────────────────────────────────────────────────────────
  section("RPC connection");
  const provider = ethers.provider;
  try {
    const t0 = Date.now();
    const block = await provider.getBlockNumber();
    const lag = ((Date.now() - t0) / 1000).toFixed(2);
    ok(`Connected · block ${block} · RTT ${lag}s`);
    const net = await provider.getNetwork();
    if (Number(net.chainId) !== 43113) {
      fail(`Wrong chain · expected 43113, got ${net.chainId}`);
    }
  } catch (err) {
    fail(`RPC unreachable · ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }

  // ── Contracts deployed ─────────────────────────────────────────────────
  section("Deployed contracts");
  const contractsToCheck: Array<{ name: string; address: string }> = [
    { name: "MockUSDC", address: d.contracts.mockUsdc },
    { name: "IdentityRegistry", address: d.contracts.identityRegistry },
    { name: "Orderbook", address: d.contracts.orderbook },
  ];
  for (const [sym, addr] of Object.entries(d.contracts.securityTokens)) {
    contractsToCheck.push({ name: `Token ${sym}`, address: addr });
  }
  for (const [sym, addr] of Object.entries(d.contracts.publicTokens ?? {})) {
    contractsToCheck.push({ name: `PubToken ${sym}`, address: addr });
  }

  for (const c of contractsToCheck) {
    const code = await provider.getCode(c.address);
    if (code === "0x") {
      fail(`${pad(c.name, 18)} ${short(c.address)} · no bytecode`);
    } else {
      ok(`${pad(c.name, 18)} ${short(c.address)}`);
    }
  }

  // ── Deployer wallet ────────────────────────────────────────────────────
  section(`Deployer wallet (${short(d.deployer)})`);
  const [signer] = await ethers.getSigners();
  if (signer.address.toLowerCase() !== d.deployer.toLowerCase()) {
    warn(
      `Signer ${short(signer.address)} ≠ deployer in fuji.json — using signer for live checks`,
    );
  }

  const avax = await provider.getBalance(signer.address);
  const avaxNum = Number(ethers.formatEther(avax));
  if (avaxNum >= MIN_AVAX) {
    ok(`AVAX balance ${avaxNum.toFixed(4)} (above ${MIN_AVAX} threshold)`);
  } else {
    warn(
      `AVAX balance ${avaxNum.toFixed(4)} (below ${MIN_AVAX} — top up from https://core.app/tools/testnet-faucet/)`,
    );
  }

  const usdc = await ethers.getContractAt("MockUSDC", d.contracts.mockUsdc);
  const usdcBal = await usdc.balanceOf(signer.address);
  const usdcNum = Number(ethers.formatUnits(usdcBal, 6));
  if (usdcNum >= MIN_USDC) {
    ok(`USDC balance ${usdcNum.toLocaleString("en-US")} (above ${MIN_USDC} threshold)`);
  } else {
    warn(
      `USDC balance ${usdcNum.toLocaleString("en-US")} (below ${MIN_USDC} — mint via /kyc page or call MockUSDC.mint)`,
    );
  }

  const identityRegistry = await ethers.getContractAt(
    "IdentityRegistry",
    d.contracts.identityRegistry,
  );
  const isVerified = await identityRegistry.isVerified(signer.address);
  if (isVerified) {
    ok(`KYC verified · true`);
  } else {
    ok(`KYC verified · false (fresh state — good for live demo of /kyc flow)`);
  }

  // ── Orderbook depth ────────────────────────────────────────────────────
  section("Orderbook depth (active orders per token)");
  const orderbook = await ethers.getContractAt(
    "Orderbook",
    d.contracts.orderbook,
  );

  const allTokens: Array<{ universe: string; sym: string; addr: string }> = [];
  for (const [sym, addr] of Object.entries(d.contracts.securityTokens)) {
    allTokens.push({ universe: "Private", sym, addr });
  }
  for (const [sym, addr] of Object.entries(d.contracts.publicTokens ?? {})) {
    allTokens.push({ universe: "Public", sym, addr });
  }

  let lowDepthCount = 0;
  for (const t of allTokens) {
    let orders: ReadonlyArray<{ active: boolean; isBuy: boolean }>;
    try {
      orders = await orderbook.getOrdersForToken(t.addr);
    } catch (err) {
      fail(
        `${pad(`${t.universe} ${t.sym}`, 14)} fetch failed · ${
          err instanceof Error ? err.message.split("\n")[0] : err
        }`,
      );
      continue;
    }
    const active = orders.filter((o) => o.active);
    const bids = active.filter((o) => o.isBuy).length;
    const asks = active.length - bids;
    const total = active.length;
    const line = `${pad(`${t.universe} ${t.sym}`, 14)} ${pad(
      `${total} active`,
      12,
    )} (${bids} bid · ${asks} ask)`;
    if (total === 0) {
      fail(`${line} — empty (run \`pnpm seed:fuji\`)`);
    } else if (total < MIN_ORDERS_PER_TOKEN) {
      warn(`${line} — below ${MIN_ORDERS_PER_TOKEN} (re-seed recommended)`);
      lowDepthCount += 1;
    } else {
      ok(line);
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────
  console.log(
    "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  );
  const status =
    criticals > 0
      ? `\x1b[31m${criticals} critical · ${warnings} warning${warnings === 1 ? "" : "s"}\x1b[0m`
      : warnings > 0
        ? `\x1b[33m${warnings} warning${warnings === 1 ? "" : "s"}\x1b[0m`
        : `\x1b[32mall green\x1b[0m`;
  console.log(`Summary: ${status}`);

  if (criticals > 0) {
    console.log(`\nFix the criticals above before live demo. Likely commands:`);
    console.log(`  - \x1b[36mpnpm deploy:fuji\x1b[0m       (if contracts missing)`);
    console.log(`  - \x1b[36mpnpm seed:fuji\x1b[0m         (if orderbook is empty)`);
    process.exit(1);
  }
  if (warnings > 0) {
    console.log(`\nWarnings won't block the demo but are worth addressing.`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
