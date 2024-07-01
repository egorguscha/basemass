import { useEffect, useMemo, useState } from "react";

import gameRoomAbi from "@/abi/game-room.abi.json";
import Button from "@/components/Button/Button";
import { PayMethod } from "@/components/PayMethod/PayMethod";
import { Planet } from "@/components/Planet/Planet";
import { PlanetDataList } from "@/components/PlanetDataList/PlanetDataList";
import { PlanetList } from "@/components/PlanetList/PlanetList";
import { useChainManager } from "@/hooks/useChainManager";
import usePlanets from "@/hooks/usePlanets";
import Head from "next/head";
import { useRouter } from "next/router";
import { parseEther } from "viem";
import { useTransactionReceipt, useWriteContract } from "wagmi";
import { Header } from "../components/Header/Header";
import { GAME_ROOM_CONTRACT_ADDRESS } from "../constants";

export default function Dashboard() {
  const { connectWallet, account, isLoggedIn } = useChainManager();

  const router = useRouter();
  const [planetSelected, setPlanetSelected] = useState(0);

  const { data: planetsAvailable = [] } = usePlanets();

  const selectedPlanet = useMemo(() => {
    if (planetsAvailable.length === 0) {
      return null;
    }

    const selected = planetsAvailable[planetSelected];

    localStorage.setItem("selectedPlanet", JSON.stringify(selected));

    return selected;
  }, [planetsAvailable, planetSelected]);

  const connectAndReload = () => {
    connectWallet();
    // router.reload();
  };

  const { writeContractAsync: enterRoom, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useTransactionReceipt({ hash });

  const handleEnterRoom = async () => {
    try {
      await enterRoom({
        address: GAME_ROOM_CONTRACT_ADDRESS,
        abi: gameRoomAbi,
        functionName: "enterRoom",
        account: account.address,
        value: parseEther("0.002"),
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!isConfirmed) return;

    router.push("/waiting-room");
  }, [isConfirmed]);

  return (
    <>
      <Head>
        <title>Dashboard - Basemass </title>
      </Head>

      <Header />

      <main className="dashboard container">
        <div className="dashboard__left">
          <PlanetList
            planetsAvailable={planetsAvailable}
            setPlanetSelected={setPlanetSelected}
            planetSelected={planetSelected}
          />
          {/* <ServerSelector /> */}
        </div>

        <div className="dashboard__center">
          <img src="/img/bg-planet.png" className="planet_outline" />
          <Planet
            mintHash={selectedPlanet?.genHash}
            collectionId={selectedPlanet?.collectionId}
          />
        </div>

        <div className="dashboard__right">
          <PlanetDataList
            mintHash={selectedPlanet?.genHash}
            collectionId={selectedPlanet?.collectionId}
          />
        </div>

        <button
          className="btn btn--center btn--wide dashboard__area-mint"
          onClick={() =>
            window.open(
              "https://www.fxhash.xyz/generative/0xe68aC4BbaB9d5857E5b3bA68978B022385e44f37",
              "_blank"
            )
          }
        >
          <span className="btn__iconPlus"></span> MINT NEW PLANET
        </button>

        <span
          data-tip
          data-for="cannotPlayTooltip"
          className="dashboard__area-play"
        >
          {isLoggedIn ? (
            <Button
              disabled={isConfirming}
              loading={isConfirming}
              className="btn btn--center"
              onClick={handleEnterRoom}
              label={"PLAY"}
            />
          ) : (
            <Button
              label="Connect wallet"
              className="btn btn--center"
              onClick={connectAndReload}
            />
          )}
          {/* <Button
            className="btn btn--center"
            onClick={
              isLoggedIn
                ? SHOULD_USE_LOCAL_DEV_SERVER
                  ? joinDevServer
                  : enterRoom
                : connectAndReload
            }
            label={!isLoggedIn ? "Connect wallet" : "PLAY"}
          /> */}
        </span>
      </main>
    </>
  );
}
