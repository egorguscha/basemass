import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { useChainManager } from "@/hooks/useChainManager";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";
import { BlackCreateWalletButton } from "../BlackCreateWalletButton/BlackCreateWalletButton";

export function Header() {
  const { connectWallet, disconnectWallet, isLoggedIn } = useChainManager();

  const { address } = useAccount();
  const balance = useBalance({ address });

  const router = useRouter();

  let link = "/leaderboard";
  let linkText = "LeaderBoard";
  let linkIcon = "/img/icon-leaderboard.png";

  if (["/leaderboard", "/stake"].includes(router.pathname)) {
    link = "/dashboard";
    linkText = "Back";
    linkIcon = "/img/icon-back.png";
  }

  const connectAndReload = () => {
    connectWallet();
    //   router.reload();
  };

  const disconnectAndReload = () => {
    disconnectWallet();
    // router.reload();
  };

  const addressForDisplay =
    isLoggedIn && address
      ? `${address.slice(0, 7)}...${address.slice(-3)}`
      : "";

  return (
    <header className="header container">
      <div className="header__linkBlock">
        <Image
          className="header__icon"
          src={linkIcon}
          layout="fixed"
          width={21}
          height={31}
          alt=""
        />
        <Link href={link} className="header__link">
          {linkText}
        </Link>
      </div>

      <div className="header__money money">
        <div className="money__item">
          <div className="money__name">ETH</div>
          <div className="money__num">
            {balance?.data
              ? Number(
                  formatUnits(balance.data.value, balance.data.decimals)
                ).toFixed(4)
              : 0}
          </div>
        </div>
      </div>

      <div className="header__linkBlock">
        {isLoggedIn && (
          <div className="header__address-text">{addressForDisplay}</div>
        )}

        { !isLoggedIn ? <BlackCreateWalletButton /> : null }
        <Image
          className="header__icon"
          src="/img/icon-log-out.png"
          layout="fixed"
          width={43}
          height={34}
          alt=""
        />
        <a
          className="header__link"
          onClick={() =>
            !isLoggedIn ? connectAndReload() : disconnectAndReload()
          }
        >
          {!isLoggedIn ? "Connect wallet" : "Log out"}
        </a>
      </div>
    </header>
  );
}
