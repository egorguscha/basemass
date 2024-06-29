import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useChainManager } from "@/hooks/useChainManager";
import fetchCanClaimRewards from "@/services/canClaimRewards/fetchCanClaimRewards";
import { useBalance, useWriteContract } from "wagmi";

const useCanClaimRewards = (operationParams) => {
  const router = useRouter();
  const { isLoggedIn } = useChainManager();
  const { data } = useBalance();
  const { serverName, packed, signed } = operationParams;

  return useQuery({
    queryKey: ["canClaimRewards", operationParams],
    queryFn: () => fetchCanClaimRewards(data.value, operationParams),
    // The query will not execute until enabled is true
    enabled: isLoggedIn && !!serverName && !!packed && !!signed,
    // Refetching only when on /last-game-stats page and no one yet has claimed rewards
    refetchInterval: (query) =>
      router.pathname === "/last-game-stats" && !query.state.error
        ? 500
        : false,
    // Infinitely retrying when the game is still active to show loading indicator
    retry: (_, error) => error === "GAME_STILL_ACTIVE",
    retryDelay: 1000,
  });
};

export default useCanClaimRewards;
