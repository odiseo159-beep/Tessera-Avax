import { useReadContract, useAccount } from "wagmi";
import {
  abis,
  contractAddresses,
  contractsReady,
  ZERO_ADDRESS,
} from "@/lib/contracts";

export type KycState = "disconnected" | "loading" | "unconfigured" | "verified" | "pending";

export interface KycStatus {
  state: KycState;
  address: `0x${string}` | undefined;
}

/// Read IdentityRegistry.isVerified for the connected wallet. Returns a state
/// that the UI can render directly without further branching.
export function useKycStatus(): KycStatus {
  const { address, status } = useAccount();

  const enabled =
    status === "connected" &&
    contractsReady &&
    contractAddresses.identityRegistry !== ZERO_ADDRESS &&
    !!address;

  const { data, isLoading } = useReadContract({
    abi: abis.identityRegistry,
    address: contractAddresses.identityRegistry,
    functionName: "isVerified",
    args: enabled ? [address!] : undefined,
    query: { enabled },
  });

  if (status !== "connected") return { state: "disconnected", address };
  if (!contractsReady) return { state: "unconfigured", address };
  if (isLoading) return { state: "loading", address };
  return { state: data ? "verified" : "pending", address };
}
