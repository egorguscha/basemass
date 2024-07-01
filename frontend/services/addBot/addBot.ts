import gameRoomAbi from "@/abi/game-room.abi.json";
import { publicClient } from "@/config/config";
import BN from "bignumber.js";
import { GAME_ROOM_CONTRACT_ADDRESS } from "../../constants";
import { getBots } from "../../staticData";
import { getBotAdditionDelay } from "./getBotAdditionDelay";
import createError from "./infra/createError";
import isPlayerBot from "./infra/isPlayerBot";
import recursivelyTryAddingBot from "./infra/recursivelyTryAddingBot";

export default async function addBot(serverName) {
  return new Promise(async (resolve, reject) => {
    try {
      const players = (await publicClient.readContract({
        address: GAME_ROOM_CONTRACT_ADDRESS,
        abi: gameRoomAbi,
        functionName: "getPlayers",
      })) as any[];

      // console.log("PLAYERS", players);

      const endBlockRaw = (await publicClient.readContract({
        address: GAME_ROOM_CONTRACT_ADDRESS,
        abi: gameRoomAbi,
        functionName: "finalBlock",
      })) as BigInt;

      const BOTS = getBots();

      // If currBotMinJoinTime have elapsed:
      // Creating an availableBots array from the bots, who are not registered as players in the contract

      const availableBots = BOTS.filter(
        (bot) => !players.includes(`${bot.address}`)
      );

      const operationHash = await recursivelyTryAddingBot(
        availableBots,
        serverName
      );

      // Filter by passed server
      let promisifiedCurrentServerWaitRoom = [];

      players.forEach((playerName) => {
        const address = playerName.match(/[a-zA-Z0-9]+/)?.[0];
        promisifiedCurrentServerWaitRoom.push(
          new Promise(async (resolve, reject) => {
            try {
              resolve({
                address,
                isBot: await isPlayerBot(address),
              });
            } catch (err) {
              reject(err);
            }
          })
        );
      });

      const currentServerWaitRoom = await Promise.all(
        promisifiedCurrentServerWaitRoom
      );

      // Checking if there are players in the waiting room
      if (currentServerWaitRoom.length === 0) {
        const error = createError(
          500,
          `Server '${serverName}' has no players in the waiting room`
        );
        reject(error);
        return;
      }

      // Check if there are real players on the server
      const hasCurrentServerRealPlayers = currentServerWaitRoom.some(
        (player) => player.isBot === false
      );

      if (!hasCurrentServerRealPlayers) {
        const error = createError(
          500,
          `Server '${serverName}' has no real players in the waiting room`
        );
        reject(error);
        return;
      }

      // Checking if the game on the selected server has already started
      //   const contractRooms = storage.room.valueMap;

      if (!BN(Number(endBlockRaw)).isZero()) {
        const error = createError(
          500,
          `The game on the '${serverName}' server has already started`
        );
        reject(error);
        return;
      }

      // Getting the required waiting time to add a bot
      const botAdditionDelay = await getBotAdditionDelay(currentServerWaitRoom);

      // If currBotMinJoinTime have not elapsed responding with an error
      if (botAdditionDelay > 0) {
        const error = createError(
          500,
          `The required waiting time to add a bot have not yet passed`
        );
        reject(error);
        return;
      }

      // If there are no available bots
      if (availableBots.length === 0) {
        // Getting a stuck bot (bot on the server with no real players)
        // const stuckBot = await getFirstStuckBot(storage);

        // if (!stuckBot) {
        //   const error = createError(500, "No available bots");
        //   reject(error);
        //   return;
        // }

        // const prevServerName = players.get(`"${stuckBot.address}"`)?.room_id;

        // const operationHash = await requestAddingBot(stuckBot, serverName, {
        //   shouldRefund: true,
        //   prevServerName,
        // });

        // resolve(operationHash);
        return;
      }

      // Recursively trying to add a bot, in case of an error - trying the next and so on
      // If successful - responding with an operation hash
      // If not successful (or if any other error was catched inside try/catch block) - ...
      // .. responding with an error
      resolve(operationHash);
    } catch (error) {
      reject(createError(500, "Cannot add a bot"));
      console.error(error);
    }
  });
}
