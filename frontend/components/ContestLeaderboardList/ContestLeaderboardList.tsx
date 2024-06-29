import React from "react";
import { useChainManager } from "@/hooks/useChainManager";
import useContestLeaderboard from "@/hooks/useContestLeaderboard";
import { useAccount } from "wagmi";

export function ContestLeaderboardList() {
  const {} = useChainManager();
  const { address } = useAccount();

  const { data: leaderboard, isLoading, isError } = useContestLeaderboard();

  return (
    <div className="contestLeaderboardList">
      <h2 className="contestLeaderboardList__title">LEADERBOARD:</h2>
      <ul className="contestLeaderboardList__list">
        {!isLoading &&
          !isError &&
          leaderboard.map((player) => (
            <li
              className={`contestLeaderboardList__item ${
                address === player.address
                  ? "contestLeaderboardList__item--active"
                  : ""
              }`}
              key={`${player.place}-${player.address}`}
            >
              <p className="contestLeaderboardList__place">{player.place}.</p>
              <p className="contestLeaderboardList__name">
                {player.domainName ?? player.address}
              </p>
              <p className="contestLeaderboardList__score">
                {player.score} pts
              </p>
            </li>
          ))}
      </ul>
    </div>
  );
}
