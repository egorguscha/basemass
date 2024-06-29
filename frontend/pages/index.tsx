import Head from "next/head";
import Image from "next/legacy/image";
import Link from "next/link";

export default function Landing() {
  return (
    <>
      <Head>
        <title>Basemass</title>
      </Head>

      <main className="lp container container--small">
        <div className="lp__content">
          <Image
            className="lp__logo"
            src="/img/logo-big.svg"
            width={982}
            height={282}
            alt="Logo"
          />
          <p className="lp__text">
            Fight with players from all over the world as you try to become the
            biggest Planet in a solar system! Control your tiny planet and eat
            other players to grow larger. Mint your own, unique generative
            planet as NFT to enter the battlefield!
          </p>
          <Link href="/dashboard" className="lp__btn btn btn--center">
            Join the game
          </Link>
        </div>
        <div className="lp__bg">
          <video
            className="lp__video"
            loop
            muted
            autoPlay
            poster={"/img/lp-bg-poster.png"}
          >
            <source src="/video/lp-bg-video-6.mp4" type="video/mp4" />
            <source src="video/lp-bg-video-8.webm" type="video/webm" />
          </video>
          <div className="lp__overlay"></div>
        </div>
      </main>
    </>
  );
}
