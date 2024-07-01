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
import { getLogs, watchAsset } from "viem/actions";
import { coinbaseWallet, injected } from 'wagmi/connectors';
import { defineChain } from "viem";

export const tempConfig = defineChain({
  id: 8453,
  name: "Base Mainnet",
  rpcUrls: {
    default: { http: ["https://lb.drpc.org/ogrpc\?network\=base\&dkey\=Ah6ynCE1ckILgW6n3fdltZuLyEZgM8IR76Q8hkHL9tz4"] },
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
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'Basemass',
      preference: 'smartWalletOnly',
    }),
  ],
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
