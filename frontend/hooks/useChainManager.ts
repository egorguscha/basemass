import {
  http,
  createConfig,
  useClient,
  useConnectorClient,
  useConnect,
  useChainId,
  useDisconnect,
  useAccount,
} from "wagmi";
import { blastSepolia, modeTestnet } from "wagmi/chains";
import { getLogs, watchAsset } from "viem/actions";
import { metaMask } from "wagmi/connectors";
import { defineChain } from "viem";

export const tempConfig = defineChain({
  id: 919,
  name: "Mode Sepolia Testnet",
  rpcUrls: {
    default: { http: ["https://mode-testnet.drpc.org"] },
  },
  nativeCurrency: {
    name: "Ethereum",
    decimals: 18,
    symbol: "ETH",
  },
});
export const config = createConfig({
  chains: [tempConfig],
  ssr: true,
  transports: {
    [tempConfig.id]: http(),
  },
});

export function useChainManager() {
  const chainId = useChainId();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const account = useAccount();

  const connectWallet = () => {
    connect({ chainId, connector: connectors[0] });
  };

  const disconnectWallet = () => {
    disconnect();
  };

  return {
    account,
    isLoggedIn: account.isConnected,
    connectWallet,
    disconnectWallet,
  };
}
