import { useChainManager } from "@/hooks/useChainManager";
import useTimer from "@/hooks/useTimer";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CONTRACT_ADDRESS, GAME_ROOM_CONTRACT_ADDRESS } from "../constants";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import Button from "@/components/Button/Button";
import { Header } from "@/components/Header/Header";
import ShareButton from "@/components/ShareButton/ShareButton";

import gameRoomAbi from "@/abi/game-room.abi.json";
import getShareText from "@/utils/getShareText";
import { formatEther } from "viem";
import { useTransactionReceipt, useWriteContract } from "wagmi";

const signalR = require("@microsoft/signalr");

export default function LastGameStats() {
  const { account, isLoggedIn } = useChainManager();
  const addressStateRef = useRef();
  const address = account.address;

  // Storing address state in ref, for it to be read accessible inside ...
  // .. handleEndGameOperation() callback, which runs on "operations" ...
  // .. websocket updates
  addressStateRef.current = address;

  const router = useRouter();

  // const { serverName } = useSelectedServerContext();
  const serverName = "NYC";
  const { setTimer, remainingSeconds } = useTimer({ cancelOnUnmount: true });

  const { packed, signature, leaderboard } = router.query;

  const [
    isRedirectDialogOpeningRequested,
    setIsRedirectDialogOpeningRequested,
  ] = useState(false);

  const [redirectTitle, setRedirectTitle] = useState("");

  const [leaderboardForDisplay, setLeaderboardForDisplay] = useState<
    { address: string; score: string }[] | null
  >(null);
  const { data: hash, writeContractAsync: endGame } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useTransactionReceipt({ hash });

  // const canClaimRewards = useCanClaimRewards({
  //   serverName,
  //   packed,
  //   signed: signature,
  // });
  useEffect(() => {
    if (!leaderboard) return;

    const fetchLeaderboardWithDomains = async () => {
      try {
        const parsedLeaderboard = JSON.parse(leaderboard);

        setLeaderboardForDisplay(
          parsedLeaderboard.map((item) => ({ address: item.player, ...item }))
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchLeaderboardWithDomains();
  }, [leaderboard]);

  const redirectToDashboard = useCallback(() => {
    router.push("/dashboard");
  }, []);

  const openRedirectDialog = useCallback(() => {
    setIsRedirectDialogOpeningRequested(true);

    setTimer(redirectToDashboard, 5000);
  }, [redirectToDashboard]);

  const handleEndGameOperation = useCallback(
    (msg) => {
      const {
        type: operationType,
        data: [
          {
            parameter: {
              entrypoint: operationEntrypoint,
              value: { serverid: operationServerName },
            },
          },
        ],
      } = msg;

      const transactions = msg.data;

      const isCurrentServerEndGameOperation =
        operationType === 1 &&
        operationEntrypoint === "end_game" &&
        operationServerName === serverName;

      if (!isCurrentServerEndGameOperation) return;

      const currentPlayerTransaction = transactions.find((transaction) => {
        return transaction.target.address === addressStateRef.current;
      });

      // Redirecting if another player has already claimed rewards
      if (!currentPlayerTransaction) {
        setRedirectTitle(
          "You didn't make it into top 3 this game.\nBetter luck next time!"
        );
        openRedirectDialog();
        return;
      }

      const transactionAmount = currentPlayerTransaction.amount / 1e6;

      setRedirectTitle(`Congratulations! You have earned ${transactionAmount}`);
      openRedirectDialog();
    },
    [serverName, addressStateRef]
  );

  useEffect(() => {
    let isMounted = true;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`http://localhost:8080/v1/ws`)
      .build();

    async function init() {
      try {
        await connection.start();
        await connection.invoke("SubscribeToOperations", {
          address: CONTRACT_ADDRESS,
          type: "transaction",
        });
      } catch (error) {
        console.log(error);
      }
    }

    // auto-reconnect
    connection.onclose(() => {
      // Preventing websocket connection from starting when the ...
      // .. component is unmounted. This is necessary because ...
      // .. onclose() method will be triggered even if the component ...
      // ..has been unmounted.
      if (!isMounted) return;

      init();
    });

    connection.on("operations", handleEndGameOperation);

    init();

    return () => {
      isMounted = false;
      connection.off("operations");
      if (
        connection &&
        connection.state === signalR.HubConnectionState.Connected
      ) {
        connection.stop();
      }
    };
  }, []);

  const darkTheme = createTheme({ palette: { mode: "dark" } });

  const isRedirectingDialogOpen = useMemo(
    () =>
      isRedirectDialogOpeningRequested &&
      redirectTitle !== null &&
      remainingSeconds !== null,
    [isRedirectDialogOpeningRequested, redirectTitle, remainingSeconds]
  );

  const playerPlace = useMemo(() => {
    if (!leaderboard || !address) return null;

    return (
      JSON.parse(leaderboard).findIndex(
        (element) => element.address === address
      ) + 1 || null
    );
  }, [leaderboard, address]);

  const payDividends = async () => {
    const lb = JSON.parse(leaderboard).map((item) => ({
      ...item,
      score: BigInt(item.score),
    }));

    try {
      const result = await endGame({
        abi: gameRoomAbi,
        address: GAME_ROOM_CONTRACT_ADDRESS,
        functionName: "endGame",
        args: [packed, signature, lb],
      });
      console.log(result);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (!isConfirmed) return;

    router.push("/dashboard");
  }, [isConfirmed]);

  return (
    <div className="background">
      <Head>
        <title>Game Winners - Basemass</title>
      </Head>
      <Header />
      <main className="container container--small">
        <div className="statList statList--wide">
          <ul className="statList__list">
            {leaderboardForDisplay ? (
              leaderboardForDisplay.map((player, index) => (
                <li
                  key={player.address}
                  className={`statList__item ${
                    address === player.address ? "statList__item--active" : ""
                  }`}
                >
                  <p className="statList__rank">{index + 1}</p>
                  <p className="statList__nft">{player.address}</p>
                  <p className="statList__score">
                    {formatEther(BigInt(player.score))}
                  </p>
                </li>
              ))
            ) : (
              <li className="statList__loading">Loading...</li>
            )}
          </ul>
        </div>
        <div className="button-group">
          <Link href="/dashboard" className="btn btn--last-game-stats">
            Dashboard
          </Link>
          <span data-tip data-for="cannotClaimTooltip">
            <Button
              loading={isConfirming}
              className="btn"
              onClick={payDividends}
              disabled={
                !isLoggedIn ||
                !serverName ||
                !packed ||
                !signature ||
                isConfirmed
              }
              label="Claim Rewards"
            />
          </span>
          {/* {canClaimRewards.isError && isLoggedIn && (
            <ReactTooltip
              id="cannotClaimTooltip"
              place="top"
              type="dark"
              effect="solid"
              className="tooltip"
            >
              {canClaimRewards.error}
            </ReactTooltip>
          )} */}
          <ShareButton
            text={getShareText(playerPlace)}
            url="https://basemass.xyz"
          >
            Share to Twitter
          </ShareButton>
        </div>
        <ThemeProvider theme={darkTheme}>
          <Dialog
            open={isRedirectingDialogOpen}
            onClose={redirectToDashboard}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            sx={{
              "& .MuiDialog-paper": {
                padding: "1rem",
                backgroundColor: "rgba(42, 46, 94, 0.9)",
                backgroundImage: "none",
              },
            }}
          >
            <DialogTitle
              id="alert-dialog-title"
              sx={{
                whiteSpace: "pre-line",
                textAlign: "center",
              }}
            >
              {redirectTitle}
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                id="alert-dialog-description"
                sx={{ textAlign: "center" }}
              >
                {`Redirecting to Dashboard in ${remainingSeconds}...`}
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center" }}>
              <button
                onClick={redirectToDashboard}
                className="btn btn--center btn--small"
              >
                Go to Dashboard
              </button>
            </DialogActions>
          </Dialog>
        </ThemeProvider>
      </main>
    </div>
  );
}
