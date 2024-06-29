const fs = require("fs");
const path = require("path");
const gameRoomAbi = require("../abi/game-room.abi.json");

const { createPublicClient, http, defineChain } = require("viem");
const { blastSepolia, modeTestnet } = require("viem/chains");

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
const client = createPublicClient({
  chain: tempConfig,
  transport: http(),
});

class Mode {
  constructor() {
    this.ID = -1;
    this.name = "Blank";
    this.decayMod = 1.0; // Modifier for decay rate (Multiplier)
    this.packetLB = 49; // Packet id for leaderboard packet (48 = Text List, 49 = List, 50 = Pie chart)
    this.haveTeams = false; // True = gamemode uses teams, false = gamemode doesnt use teams
    this.specByLeaderboard = false; // false = spectate from player list instead of leaderboard
    this.IsTournament = false;
    this.playersInRoom = [];
    this.endBlock = 0;
    this.botNames = new Set([
      ...JSON.parse(
        fs.readFileSync(path.resolve("./bots.json"), { encoding: "utf8" })
      ).map((e) => e.address.toLowerCase()),
    ]);
  }
  // Override these
  onServerInit(server) {
    if (process.env.STAGE === "local") return;

    client.watchBlocks({
      onBlock: async (block) => {
        const contractAddress = process.env.CONTRACT_ADDRESS;

        console.log(contractAddress);
        const endBlockRaw = await client.readContract({
          address: contractAddress,
          abi: gameRoomAbi,
          functionName: "finalBlock",
        });

        const players = await client.readContract({
          address: contractAddress,
          abi: gameRoomAbi,
          functionName: "getPlayers",
        });

        const endBlock = Number(endBlockRaw);
        const currentBlock = Number(block.number);

        this.endBlock = endBlock;

        if (endBlock !== 0 && currentBlock <= endBlock) {
          this.playersInRoom = players || [];
        } else {
          this.playersInRoom = players;
        }

        // const { endBlock } = await axios
        //   .get(`${BASE_TZKT_API_URL}/v1/contracts/${contractAddress}/storage`)
        //   .then((res) => {
        //     const endBlock = Number(res.data.room[serverName]?.finish_block);
        //     this.endBlock = endBlock;

        //     if (endBlock !== 0 && currentBlock <= endBlock) {
        //       this.playersInRoom = res.data.server[serverName]?.players || [];
        //     } else {
        //       this.playersInRoom = [];
        //     }

        //     return { endBlock };
        //   });

        if (currentBlock > endBlock) {
          console.log({
            currentBlock: currentBlock,
            endBlock: endBlock,
          });
        }
      },
    });

    // Called when the server starts
    server.run = true;
  }

  onTick(server) {
    if (process.env.STAGE === "local") return;

    const allowedPlayersSet = new Set(this.playersInRoom);

    const encounteredPlayers = new Map();
    const serverPlayers = new Set(
      server.clients.map((socket) => socket.player._name.toLowerCase())
    );

    const alivePlayers = server.clients.flatMap((socket) => {
      const { player } = socket;

      if (!player || !player.cells || player.cells.length === 0) return [];

      return [player._name];
    });

    allowedPlayersSet.forEach((player) => {
      const isBot = this.botNames.has(player.toLowerCase());
      const isAlreadyOnTheServer = serverPlayers.has(player.toLowerCase());
      if (!isBot || isAlreadyOnTheServer) return;

      server.bots.addBot({ botName: player, useRandomName: false });
    });

    // Killing of not allowed players

    // Kill everyone and cleaning up server, when the game is not running and there are alive players / bots
    if (alivePlayers.length !== 0 && allowedPlayersSet.size === 0) {
      server.cleanUp();
      return;
    }

    // When the game is running
    for (const client of server.clients) {
      const name = client.player._name.match(/(?:<.*>)?([\w\d]+)/)?.[1];
      // Kill users whos names aren't in the storage
      if (!allowedPlayersSet.has(name)) {
        server.killPlayer(client);
      } else {
        // Kill users who are present two or more times in the game
        if (encounteredPlayers.has(client.player._name)) {
          const dupeClient = encounteredPlayers.get(client.player._name);
          server.killPlayer(client);
          server.killPlayer(dupeClient);
        }
        encounteredPlayers.set(client.player._name, client);
      }
    }
  }

  onPlayerInit() {
    // Called after a player object is constructed
  }
  onPlayerSpawn(server, player) {
    // Called when a player is spawned
    player.color = server.getRandomColor(); // Random color
    server.spawnPlayer(player, server.randomPos());
  }
  onCellAdd() {
    // Called when a player cell is added
  }
  onCellRemove() {
    // Called when a player cell is removed
  }
  updateLB(server) {
    // Called when the leaderboard update function is called
    server.leaderboardType = this.packetLB;
  }
}

module.exports = Mode;
