const {
  createPublicClient,
  http,
  parseAbi,
  toHex,
  defineChain,
  createWalletClient,
  parseEther,
} = require("viem");
const { blastSepolia, modeTestnet } = require("viem/chains");

const bots = require("./src/bots.json");
const stakeAbi = require("./stake.abi.json");
const { privateKeyToAccount } = require("viem/accounts");

const tempConfig = defineChain({
  id: 919,
  name: "Mode Sepolia Testnet",
  rpcUrls: {
    default: { http: ["https://mode-testnet.drpc.org"] },
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
