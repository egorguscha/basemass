import gameRoomAbi from "@/abi/game-room.abi.json";
import Button from "@/components/Button/Button";
import { Header } from "@/components/Header/Header";
import { Planet } from "@/components/Planet/Planet";
import { usePlayers } from "@/hooks/usePlayers";
import { useRoom } from "@/hooks/useRoom";
import axios from "axios";
import axiosRetry from "axios-retry";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount, useTransactionReceipt, useWriteContract } from "wagmi";
import { GAME_ROOM_CONTRACT_ADDRESS } from "../constants";

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: () => true,
});

export default function WaitingRoom() {
  const { address } = useAccount();
  const [roomSize, setRoomSize] = useState(10);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const router = useRouter();
  const { data: waitRoom } = usePlayers();
  const { data: roomInfo } = useRoom();

  const { writeContractAsync: leaveRoom, data: hash } = useWriteContract();
  const { isSuccess: isConfirmed, isLoading: isConfirming } =
    useTransactionReceipt({ hash });

  const handleLeaveRoom = () =>
    leaveRoom({
      address: GAME_ROOM_CONTRACT_ADDRESS,
      abi: gameRoomAbi,
      functionName: "refund",
    });

  const serverName = "NYC";
  // const { serverName } = useSelectedServerContext();

  // const { data: botAdditionDelay } = useBotAdditionDelay(waitRoom);

  // useEffect(() => {
  //   setSelectedPlanet(JSON.parse(localStorage.getItem("selectedPlanet")));
  // }, []);

  useEffect(() => {
    // if (botAdditionDelay == undefined) return;

    const controller = new AbortController();

    const requestAddingBot = async () => {
      try {
        await axios({
          method: "POST",
          url: `/api/add-bot/${serverName}`,
          signal: controller.signal,
        });
      } catch (error) {
        console.error(error);
      }
    };

    const botRequestingTimeout = setTimeout(requestAddingBot, 1000);

    return () => {
      clearTimeout(botRequestingTimeout);
      controller.abort();
    };
  }, []);

  console.log("waitRoom__", waitRoom);

  console.log(roomInfo);
  if (waitRoom?.length === Number(roomInfo?.maxPlayers)) {
    router.push({
      pathname: "/hud",
      query: { endBlock: Number(roomInfo?.finalBlock) },
    });
  }

  useEffect(() => {
    if (!isConfirmed) return;

    router.push("/dashboard");
  }, [isConfirmed]);

  return (
    <>
      <Head>
        <title>Waiting room - Basemass</title>
      </Head>

      <Header />

      <main className="page container">
        <div className="page__left">
          <div className="listBlock">
            <h2 className="listBlock__title blockTitle">
              {waitRoom
                ? `Waiting for players ${waitRoom?.length} / ${roomSize}`
                : "Loading players list..."}
            </h2>
            <ul className="listBlock__list">
              {waitRoom &&
                waitRoom.map((player) =>
                  player === address ? (
                    <li
                      key={player}
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        wordWrap: "nowrap",
                      }}
                      className="listBlock__item listBlock__item--active"
                    >
                      {player}
                    </li>
                  ) : (
                    <li
                      key={player}
                      style={{ overflow: "hidden" }}
                      className="listBlock__item"
                    >
                      {player}
                    </li>
                  )
                )}
            </ul>
            {/* <ul className="listBlock__list">
              {roomSize !== -1 &&
                waitRoom &&
                waitRoom.map((player) =>
                  player.address === address ? (
                    <li
                      key={player.address}
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        wordWrap: "nowrap",
                      }}
                      className="listBlock__item listBlock__item--active"
                    >
                      {player.Domain || player.address}
                    </li>
                  ) : (
                    <li
                      key={player.address}
                      style={{ overflow: "hidden" }}
                      className="listBlock__item"
                    >
                      {player.Domain || player.address}
                    </li>
                  )
                )}
            </ul> */}
          </div>
        </div>

        <div className="page__center">
          <div className="planet__wrapper--flex-gap">
            <Planet
              mintHash={selectedPlanet?.genHash}
              collectionId={selectedPlanet?.collectionId}
            />

            <Button
              className="btn btn--center"
              onClick={handleLeaveRoom}
              label={"Leave Room"}
              loading={isConfirming}
              disabled={isConfirming}
            />
          </div>
        </div>

        <div className="page__right"></div>
      </main>
    </>
  );
}
