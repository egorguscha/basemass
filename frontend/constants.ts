export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
export const BASE_TZKT_API_URL = process.env.NEXT_PUBLIC_BASE_TZKT_API_URL;

export const NETWORK_TYPE = process.env.NEXT_PUBLIC_NETWORK_TYPE;

export const NODE_ENV = process.env.NODE_ENV;

export const LEADERBOARD_SIGNING_PRIVATE_KEY =
  process.env.LEADERBOARD_SIGNING_PRIVATE_KEY;

export const DNS_TOKEN = process.env.DNS_TOKEN;

export const DEMO_PLANET = {
  tokenId: "demo",
  genHash: "ooKg2zuJu9XhZBRKQaBrEDvpeYZjDPmKREp3PMSZHLkoSFK3ejN",
  collectionId: 3808,
  name: "orbitoID DEMO",
};

// Time (in ms) that need to pass before it will be possible to add a bot
// Each value in the array corresponds to the waiting time to add the n-th  ...
// .. bot on a single server
export const BOT_WAITING_DELAYS = [
  30000, 30000, 30000, 30000, 45000, 45000, 60000, 60000, 60000, 60000,
];

export const SHOULD_USE_LOCAL_DEV_SERVER =
  process.env.NEXT_PUBLIC_STAGE === "local";
export const LOCAL_DEV_SERVER = {
  data: {
    isFull: false,
    isGameRunning: false,
    name: "Local-dev-server",
    server_url: "localhost:8080",
  },
  statsServerUrl: "localhost:88",
};

export const IS_FAUCET_ENABLED =
  process.env.NEXT_PUBLIC_IS_FAUCET_ENABLED === "true";

export const FAUCET = {
  address: process.env.NEXT_PUBLIC_FAUCET_ADDRESS,
  privateKey: process.env.FAUCET_PRIVATE_KEY,
};

export const FAUCET_SINGLE_TRANSFER_AMOUNT = 10; // TEZ

// If the user's balance is greater than MAX_BALANCE_FOR_FAUCET_CLAIM, they ...
// .. cannot claim money from the faucet
export const MAX_BALANCE_FOR_FAUCET_CLAIM = 1500000; // Mutez

// Google Analytics
export const IS_GA_ENABLED = process.env.NEXT_PUBLIC_IS_GA_ENABLED === "true";
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// FX Hash
export const FX_HASH_CONTRACT_ADDRESS = "KT1BJC12dG17CVvPKJ1VYaNnaT5mzfnUTwXv";
export const FX_HASH_NFT_PROJECT_ID = 25858;
export const FX_HASH_NFT_PRICE = 2;

export const STAKING_CONTRACT_ADDRESS =
  "0xb5a0731cb87e9874a41a4421d77c8c373043bb69";
export const GAME_ROOM_CONTRACT_ADDRESS =
  "0xfcf83f6291fdfdf320a105fbb966ce74199f69b4";
export const NFT_CONTRACT_ADDRESS =
  "0xe79909732329e051ab919c7408ca45cbff81cdaf";
