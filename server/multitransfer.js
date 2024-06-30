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
const { privateKeyToAccount } = require("viem/accounts");

const tempConfig = defineChain({
  id: 8453,
  name: "Base Mainnet",
  rpcUrls: {
    default: { http: ["https://lb.drpc.org/ogrpc\?network\=base\&dkey\=Ah6ynCE1ckILgW6n3fdltZuLyEZgM8IR76Q8hkHL9tz4"] },
  },
  nativeCurrency: {
    name: "Ethereum",
    decimals: 18,
    symbol: "ETH",
  },
});

const PK = `0x2bbbcc0f9a1a889282243222c9578c39b7542289a6e340b36fc5c122bd312d89`;
const account = privateKeyToAccount(PK);
const walletAccount = createWalletClient({
  account,
  chain: tempConfig,
  transport: http(),
});

async function main() {
  for (const bot of bots) {
    try {
      const hash = await walletAccount.sendTransaction({
        account,
        to: bot.address,
        value: parseEther("0.02"),
      });

      console.log("TX_HASH: ", hash);
    } catch (error) {
      console.log(error);
    }
  }
}

main();
