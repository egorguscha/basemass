import Head from "next/head";
import Image from "next/legacy/image";
import { Header } from "@/components/Header/Header";
import { ContestPrizesList } from "@/components/ContestPrizesList/ContestPrizesList";
import { ContestLeaderboardList } from "@/components/ContestLeaderboardList/ContestLeaderboardList";
import {
  useAccount,
  useReadContract,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { formatEther, formatUnits, parseAbi, parseEther } from "viem";
import stakeAbi from "../abi/stake.abi.json";
import { STAKING_CONTRACT_ADDRESS } from "@/constants";
import {
  addSeconds,
  formatDuration,
  intervalToDuration,
  secondsToMilliseconds,
} from "date-fns";
import { useEffect, useState } from "react";

type StakeInfo = [BigInt, BigInt, BigInt];
export default function Stake() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { address, isConnected } = useAccount();

  const {
    data: stakeInfo,
    isLoading: stakeInfoIsLoading,
    refetch: refetchStakeInfo,
  } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakeAbi,
    functionName: "stakes",
    args: [address],
  });
  const { data: stakedNFT, isLoading: stakedNFTIsLoading } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakeAbi,
    functionName: "getStakedNFT",
    args: [address],
  });

  const handleStake = () => {
    writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: stakeAbi,
      functionName: "stake",
      value: parseEther("0.01"),
    });
  };

  const handleUnstake = () => {
    const [tokenId] = stakedNFT as [BigInt];

    if (!tokenId) return;

    writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: stakeAbi,
      functionName: "unstake",
      args: [Number(tokenId)],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (isConfirmed) {
      refetchStakeInfo();
    }
  }, [isConfirmed]);

  const [staked] = stakeInfo ?? [];
  return (
    <>
      <Head>
        <title>Stake</title>
      </Head>

      <Header />

      <main className="leaderBoard container">
        <div>
          <StakeInfo info={stakeInfo as StakeInfo} />

          {staked ? (
            <button
              className="btn btn--center btn--wide "
              onClick={handleUnstake}
              disabled={isPending || !isConnected || isConfirming}
            >
              {isPending || isConfirming ? "CONFIRMING..." : "UNSTAKE"}
            </button>
          ) : (
            <button
              className="btn btn--center btn--wide dashboard__area-mint"
              onClick={handleStake}
              disabled={isPending || !isConnected}
            >
              {isPending || isConfirming ? "CONFIRMING..." : "STAKE"}
            </button>
          )}
        </div>
      </main>
    </>
  );
}

const StakeInfo = ({ info = [] }: { info: StakeInfo | [] }) => {
  const [duration, setDuration] = useState("");
  const { isConnected } = useAccount();

  const [staked, startTimeRaw, requiredStakingPeriodRaw] = info;
  const startTime = Number(startTimeRaw);
  const requiredStakingPeriod = Number(requiredStakingPeriodRaw);

  useEffect(() => {
    if (!info) return;

    let intervalId = setInterval(() => {
      const duration = intervalToDuration({
        start: new Date(secondsToMilliseconds(startTime)),
        end: new Date(secondsToMilliseconds(requiredStakingPeriod + startTime)),
      });

      const formattedDuration = formatDuration(
        {
          days: duration.days,
          hours: duration.hours,
          minutes: duration.minutes,
          seconds: duration.seconds,
        },
        {
          format: ["days", "hours", "minutes"],
          zero: true,
        }
      );
      setDuration(formattedDuration);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [info]);

  return (
    <div className="stake__content">
      {(!staked || !isConnected) && (
        <div>
          Stake ETH or Stablecoins for 7 days, instantly get a FREE NFT Planet
          for your game.
          <ul>
            <li>Keep staked 7 days, keep the Planet forever.</li>
            <li>
              Unstake early, Planet will be burned! Ready to play? Stake now!
            </li>
          </ul>
        </div>
      )}
      {staked && isConnected && (
        <div>
          If you unstake before the 7 days are up, your NFT Planet will be
          burned.
        </div>
      )}

      <div className="stake__info">
        {isConnected && (
          <>
            {staked && <div>Staked: {formatEther(staked)} </div>}
            {duration && <div>Left stake period: {duration} </div>}
          </>
        )}
      </div>
    </div>
  );
};
