import { tempConfig } from "@/hooks/useChainManager";
import { createPublicClient, http } from "viem";
import { blastSepolia, modeTestnet } from "viem/chains";

export const publicClient = createPublicClient({
  chain: tempConfig,
  transport: http(),
});
