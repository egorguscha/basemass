import React from "react";
import ReactQueryProvider from "./ReactQueryProvider";
import SelectedServerProvider from "./SelectedServerProvider";
import NotistackSnackbarProvider from "./NotistackSnackbarProvider";
import { WagmiProvider } from "wagmi";
import { config } from "@/hooks/useChainManager";

const ContextProviders = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <ReactQueryProvider>
        <SelectedServerProvider>
          <NotistackSnackbarProvider>{children}</NotistackSnackbarProvider>
        </SelectedServerProvider>
      </ReactQueryProvider>
    </WagmiProvider>
  );
};

export default ContextProviders;
