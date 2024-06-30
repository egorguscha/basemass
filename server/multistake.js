const {
  createPublicClient,
  http,
  parseAbi,
  toHex,
  defineChain,
  createWalletClient,
  parseEther,
} = require("viem");

const bots = require("./src/bots.json");
const stakeAbi = require("./stake.abi.json");
const { privateKeyToAccount } = require("viem/accounts");

const tempConfig = defineChain({
  id: 8453,
  name: "Base Mainnet",
  rpcUrls: {
    default: { http: ["https://mainnet.base.org"] },
  },
  nativeCurrency: {
    name: "Ethereum",
    decimals: 18,
    symbol: "ETH",
  },
});

const walletAccount = createWalletClient({
  chain: tempConfig,
  transport: http(),
});

const client = createPublicClient({
  chain: tempConfig,
  transport: http(),
});

async function main() {
  for (const bot of bots) {
    const account = privateKeyToAccount(bot.privateKey);

    const { request } = await client.simulateContract({
      address: "0xb5a0731cb87e9874a41a4421d77c8c373043bb69",
      account,
      abi: stakeAbi,
      functionName: "stake",
      value: parseEther("0.01"),
    });

    const hash = await walletAccount.writeContract(request);

    console.log("TX_HASH: ", hash);
  }
}

main();
