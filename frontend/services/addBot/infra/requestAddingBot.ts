import {
  CONTRACT_ADDRESS,
  RPC_URL,
  FX_HASH_CONTRACT_ADDRESS,
  FX_HASH_NFT_PROJECT_ID,
  FX_HASH_NFT_PRICE,
  NFT_CONTRACT_ADDRESS,
  GAME_ROOM_CONTRACT_ADDRESS,
  STAKING_CONTRACT_ADDRESS,
} from "../../../constants";
import PendingBotTransactions from "./PendingBotTransactions";

import nftAbi from "@/abi/nft.abi.json";
import gameRoomAbi from "@/abi/game-room.abi.json";

import { privateKeyToAccount } from "viem/accounts";
import { publicClient } from "@/config/config";
import { createWalletClient, etherUnits, http, parseEther } from "viem";
import { tempConfig } from "@/hooks/useChainManager";

const hasPlanets = async (address) => {
  const userNftsAmount = (await publicClient.readContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: nftAbi,
    functionName: "balanceOf",
    args: [address],
  })) as number;

  return userNftsAmount > 0;

  // const graphqlQuery = {
  //     query: `
  //         query($filters: ObjktFilter) {
  //             user(id: "${address}") {
  //                 objkts(filters: $filters) {
  //                     id,
  //                     name
  //                     generationHash
  //                     issuer {
  //                         id
  //                     }
  //                 }
  //             }
  //         }
  //     `,
  //     variables: { filters: { issuer_in: [ 3808, 25858 ] } }
  // };

  // return fetch("https://api.fxhash.xyz/graphql", {
  //     method: "POST",
  //     headers: {
  //         "Content-Type": "application/json",
  //         Accept: "application/json"
  //     },
  //     body: JSON.stringify(graphqlQuery)
  // })
  //     .then((res) => res.json())
  //     .then((res) => {
  //         const planetsOwned = res.data?.user?.objkts;

  //         return (planetsOwned?.length > 0)
  //     })
};

export const requestAddingBot = async (bot, serverName = "NYC", options?) => {
  const { shouldRefund = false, prevServerName = null } = options ?? {};

  const client = createWalletClient({
    chain: tempConfig,
    transport: http(),
  });
  const botAccount = await privateKeyToAccount(bot.privateKey);

  if (shouldRefund) {
    console.log(
      `Initiating refund for ${bot.address} on server ${prevServerName}`
    );

    const { request: refund } = await publicClient.simulateContract({
      address: GAME_ROOM_CONTRACT_ADDRESS,
      abi: gameRoomAbi,
      functionName: "refund",
      account: botAccount,
    });

    await client.writeContract(refund);
  }

  const { request: enterRoom } = await publicClient.simulateContract({
    address: GAME_ROOM_CONTRACT_ADDRESS,
    abi: gameRoomAbi,
    functionName: "enterRoom",
    account: botAccount,
    value: parseEther("0.002"),
  });

  return client.writeContract(enterRoom);
};
