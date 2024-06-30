import { tempConfig } from "@/hooks/useChainManager";
import { createPublicClient, http } from "viem";

export const publicClient = createPublicClient({
  chain: tempConfig,
  transport: http(),
});
