// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { TezosToolkit } from "@taquito/taquito";
import { TzktExtension } from "@tzkt/ext-taquito";
import { InMemorySigner } from "@taquito/signer";
import {
  LEADERBOARD_SIGNING_PRIVATE_KEY,
  CONTRACT_ADDRESS,
  BASE_TZKT_API_URL,
  RPC_URL,
  SHOULD_USE_LOCAL_DEV_SERVER,
} from "../../constants";
import axios from "axios";
import inMemoryCache from "memory-cache";
import {
  createPublicClient,
  decodeAbiParameters,
  encodeAbiParameters,
  encodePacked,
  getAbiItem,
  hashMessage,
  http,
  keccak256,
  parseEther,
  toBytes,
} from "viem";
import { blastSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import gameRoomAbi from "@/abi/game-room.abi.json";

const account = privateKeyToAccount(
  LEADERBOARD_SIGNING_PRIVATE_KEY as `0x${string}`
);

export default async function handler(req, res) {
  const { serverName, statsUrl, players, finalBlock, currentBlock } = req.body;

  const leaderboardMap = new Map(players.map((player) => [player, 0]));

  // Collect leaderboard data
  let rawLeaderboard;
  rawLeaderboard = inMemoryCache.get(`${serverName}-${finalBlock}`);

  if (rawLeaderboard == undefined) {
    const result = await axios.get(
      `http${SHOULD_USE_LOCAL_DEV_SERVER ? "" : ""}://${statsUrl}`
    );
    rawLeaderboard = result.data.leaderboard;
    // Only caching result when the game ended
    if (currentBlock === finalBlock) {
      inMemoryCache.put(`${serverName}-${finalBlock}`, rawLeaderboard, 300000); // cache for 5 min
    }
  }

  for (let record of rawLeaderboard) {
    if (record.name == "") continue;
    const address = record.name.match(
      /^(?:\<([[a-zA-Z0-9|]+)\>)?([a-zA-Z0-9]+)(?:\[([a-z0-9\.-]+)\])?/
    )?.[2];
    leaderboardMap.set(address, Math.round(record.score));
  }

  const fullLeaderboard = Array.from(leaderboardMap, ([player, score]) => ({
    player,
    score: parseEther(score.toString()),
  })) as { player: `0x${string}`; score: any }[];

  fullLeaderboard.sort((a, b) => Number(b.score) - Number(a.score));

  console.log("PK___", LEADERBOARD_SIGNING_PRIVATE_KEY);

  let expectedHash =
    "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;

  for (const { player, score } of fullLeaderboard) {
    expectedHash = keccak256(
      encodeAbiParameters(
        [{ type: "bytes32" }, { type: "address" }, { type: "uint256" }],
        [expectedHash, player, BigInt(score)]
      )
    );
  }

  const signature = await account.signMessage({
    message: { raw: expectedHash },
  });

  console.log(expectedHash);
  res.send({
    packed: expectedHash,
    signature,
    leaderboard: fullLeaderboard.map((item) => ({
      ...item,
      score: item.score.toString(),
    })),
  });
}
