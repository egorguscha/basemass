import { ContestLeaderboardList } from "@/components/ContestLeaderboardList/ContestLeaderboardList";
import { ContestPrizesList } from "@/components/ContestPrizesList/ContestPrizesList";
import { Header } from "@/components/Header/Header";
import Head from "next/head";
import Image from "next/legacy/image";

export default function Leaderboard() {
  return (
    <>
      <Head>
        <title>Leaderboard - Basemass</title>
      </Head>

      <Header />

      <main className="leaderBoard container">
        <div className="leaderBoard__inner">
          <ContestLeaderboardList />

          <div className="leaderBoard__right">
            <ContestPrizesList />
          </div>

          <div className="leaderBoard__bg">
            <Image src="/img/bg-leaderboard.png" layout="fill" />
          </div>
        </div>
      </main>
    </>
  );
}
