import { useAccount, useReadContract, useReadContracts } from "wagmi";
import ROOM_ABI from "@/abi/game-room.abi.json";
import { GAME_ROOM_CONTRACT_ADDRESS } from "@/constants";

const baseContract = {
  address: GAME_ROOM_CONTRACT_ADDRESS,
  abi: ROOM_ABI,
} as const;

export function useRoom() {
  const { data, ...rest } = useReadContracts({
    contracts: [
      {
        ...baseContract,
        functionName: "currentState",
      },
      {
        ...baseContract,
        functionName: "prizePool",
      },
      {
        ...baseContract,
        functionName: "gameDurationBlocks",
      },
      {
        ...baseContract,
        functionName: "MAX_PLAYERS",
      },
      {
        ...baseContract,
        functionName: "ENTRY_FEE",
      },
      {
        ...baseContract,
        functionName: "finalBlock",
      },
    ],
  });

  if (!data) {
    return { data, ...rest };
  }

  const [
    currentState,
    prizePool,
    gameDurationBlocks,
    maxPlayers,
    entryFee,
    finalBlock,
  ] = data;

  return {
    data: {
      currentState: currentState.result,
      prizePool: prizePool.result,
      gameDurationBlocks: gameDurationBlocks.result,
      maxPlayers: maxPlayers.result,
      entryFee: entryFee.result,
      finalBlock: finalBlock.result,
    },
    ...rest,
  };
}
