import ROOM_ABI from "@/abi/game-room.abi.json";
import { GAME_ROOM_CONTRACT_ADDRESS } from "@/constants";
import { useAccount, useReadContract } from "wagmi";

export function usePlayers() {
  const { address } = useAccount();
  return useReadContract({
    address: GAME_ROOM_CONTRACT_ADDRESS,
    abi: ROOM_ABI,
    account: address,
    functionName: "getPlayers",
    query: {
      enabled: !!address,
      refetchInterval: 1000,
    },
  });
}
