import Head from "next/head";
import Image from "next/legacy/image";
import Link from "next/link";

export default function Landing() {
  return (
    <>
      <Head>
        <title>Basemass</title>
      </Head>

      <main className="">
        <div
          className="lp__content"
          style={{
            position: "absolute",
            top: "50%",
            width: "100%",
            transform: "translateY(-50%)",
          }}
        >
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
