import { useQuery } from "@tanstack/react-query";
import { useChainManager } from "@/hooks/useChainManager";
import { CONTRACT_ADDRESS } from "../constants";

const getContestLeaderboard = async (resolveAddressToName) => {
  // const contract = await wallet.at(CONTRACT_ADDRESS);
  // const storage = await contract.storage();

  // const leaderboard = Array.from(
  //   storage.leaderboard.valueMap,
  //   ([address, score]) => ({
  //     address: address.match(/[a-zA-Z0-9]+/)[0],
  //     score: score.toNumber(),
  //   })
  // );

  // leaderboard.sort((a, b) => b.score - a.score);

  // leaderboard.splice(10);

  // const promisifiedLeaderboard = Promise.all(
  //   leaderboard.map(
  //     (player, index) =>
  //       new Promise(async (resolve, reject) => {
  //         try {
  //           resolve({
  //             ...player,
  //             place: index + 1,
  //             score: player.score.toLocaleString("en-US"),
  //             domainName: await resolveAddressToName(player.address),
  //           });
  //         } catch (error) {
  //           reject(error);
  //         }
  //       })
  //   )
  // );

  return [];
  return promisifiedLeaderboard;
};

const useContestLeaderboard = () => {
  const {} = useChainManager();

  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => getContestLeaderboard("resolveAddressToName"),
    // New data on key change will be swapped without the loading state
    keepPreviousData: true,
  });
};

export default useContestLeaderboard;
