import axios from "axios";
import { useEffect, useState } from "react";

import Head from "next/head";
import Image from "next/legacy/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Script from "next/script";
import { LOCAL_DEV_SERVER } from "../constants";

import InGameLeaderboard from "@/components/InGameLeaderboard/InGameLeaderboard";
import { renderInner } from "@/components/agar-client/agar-client-html";
import usePlanetRender from "@/hooks/usePlanetRender";
import useVirusAnimation from "@/hooks/useVirusAnimation";

import { usePlayers } from "@/hooks/usePlayers";
import { useRoom } from "@/hooks/useRoom";
import { useAccount, useWatchBlocks } from "wagmi";

function Hud() {
  const [shouldRenderMain, setShouldRenderMain] = useState(false);
  const router = useRouter();
  const [currentBlock, setCurrentBlock] = useState(0);
  const { data: roomInfo } = useRoom();
  const { data: players } = usePlayers();

  const endBlock = Number(roomInfo?.finalBlock);

  useWatchBlocks({
    onBlock(block) {
      console.log(block);
      setCurrentBlock(Number(block.number));
    },
  });

  console.log(currentBlock);

  const isGameFinished = !!(
    currentBlock > 0 &&
    endBlock > 0 &&
    currentBlock >= endBlock
  );

  useEffect(() => {
    let shouldRedirect = true;

    const redirectWithLeaderboard = async () => {
      shouldRedirect = false;

      const res = await axios.post("/api/get-signed-leaderboard", {
        serverName: "NYC",
        statsUrl: "localhost:88",
        players,
        finalBlock: endBlock,
        currentBlock,
      });

      router.push({
        pathname: `/last-game-stats`,
        query: {
          packed: res.data.packed,
          signature: res.data.signature,
          leaderboard: JSON.stringify(res.data.leaderboard),
        },
      });
    };

    // if (isGameFinished && shouldRedirect) {
    if (isGameFinished) {
      redirectWithLeaderboard();
    }
  }, [currentBlock, isGameFinished]);

  // useEffect(() => {
  //   const renderMain = () => {
  //     const shouldRenderTimeout = setTimeout(() => {
  //       setShouldRenderMain(true);
  //     }, 800);

  //     return { shouldRenderTimeout };
  //   };

  //   const windowInitTimeout = setTimeout(() => {
  //     window.init();
  //   }, 900);
  //   const { shouldRenderTimeout } = renderMain();

  //   return () => {
  //     clearTimeout(windowInitTimeout);
  //     clearTimeout(shouldRenderTimeout);
  //   };
  // }, []);

  useEffect(() => {
    if (!router.isReady || !roomInfo) return;

    // const optimisticEndBlock = parseInt(router.query?.endBlock);

    // axios
    //   .get(`${BASE_TZKT_API_URL}/v1/contracts/${CONTRACT_ADDRESS}/storage`)
    //   .then((res) => {
    //     const contractEndBlock = parseInt(
    //       res.data.room[`${serverName}`]?.finish_block
    //     );
    //     setEndBlock(contractEndBlock || optimisticEndBlock);
    //   });
  }, [router.isReady]);

  return (
    <>
      <Head>
        <title>Hud - Basemass</title>
      </Head>

      <div className="hud-wrapper">
        <header className="header header--hud container">
          <div className="ingame-leaderboard-wrapper">
            <InGameLeaderboard />
          </div>

          {/* <div>
            <div className="header__mass mass">2.560 * 1022 kg</div>
          </div> */}

          <div className="linkBlock-wrapper">
            <div className="header__linkBlock">
              <Image
                className="header__icon"
                src="/img/icon-home.png"
                layout="fixed"
                width={43}
                height={34}
                alt=""
              />
              <Link href="/dashboard" className="header__link">
                Home
              </Link>
            </div>
          </div>
        </header>

        <main
          className="hud"
          dangerouslySetInnerHTML={renderInner(
            LOCAL_DEV_SERVER.data.server_url
          )}
        ></main>

        {/* <footer>
          <GameProgressTimer blocksRemaining={blocksRemaining} />
        </footer> */}
      </div>
    </>
  );
}

export default function ProtectedHud() {
  // const { serverUrl } = useSelectedServerContext();
  const { address } = useAccount();
  const { data: roomInfo, isLoading: isRoomInfoLoading } = useRoom();
  const router = useRouter();

  useVirusAnimation();
  usePlanetRender();

  useEffect(() => {
    localStorage.setItem("tzAddress", address!);
    // setWalletAddress(localStorageWalletAddress);
  }, [address]);

  if (isRoomInfoLoading || !roomInfo) return <div>loading</div>;

  if (!address || roomInfo.currentState === 0) {
    router.push("/dashboard");
    return null;
  }

  return (
    <>
      <Script src="/assets/js/quadtree.js" strategy="afterInteractive" />
      <Script
        src="/assets/js/main_out.js"
        strategy="afterInteractive"
        onReady={() => {
          setTimeout(() => {
            window.init();
          }, 1000);
        }}
      />
      <Hud />
      {/* <RouteGuard
        isAllowed={address}
        redirectUrl="/dashboard"
        isLoading={address}
      >
        <Hud />
      </RouteGuard> */}
    </>
  );
}
