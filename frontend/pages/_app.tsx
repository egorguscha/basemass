import React from "react";

import ContextProviders from "@/context/ContextProviders";

import "../styles/game-gallery.css";
import "../styles/game-index.css";
import "../styles/style.scss";
import "../styles/style-lp.scss";
import BackgroundImage from "@/components/BackgroundImage/BackgroundImage";
import GoogleAnalytics from "@/components/GoogleAnalytics/GoogleAnalytics";
import { IS_GA_ENABLED } from "../constants";

function MyApp({ Component, pageProps }) {
  return (
    <>
      {IS_GA_ENABLED && <GoogleAnalytics />}
      <ContextProviders>
        <BackgroundImage />
        <Component {...pageProps} />
      </ContextProviders>
    </>
  );
}

export default MyApp;
