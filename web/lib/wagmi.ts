import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { avalancheFuji } from "viem/chains";
import { http } from "wagmi";

const projectId =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "YOUR_WC_PROJECT_ID";

const rpcUrl =
  process.env.NEXT_PUBLIC_RPC_URL ??
  "https://api.avax-test.network/ext/bc/C/rpc";

export const wagmiConfig = getDefaultConfig({
  appName: "EquityAccess",
  projectId,
  chains: [avalancheFuji],
  transports: {
    [avalancheFuji.id]: http(rpcUrl),
  },
  ssr: true,
});
