import { getBots } from "../../../staticData";
import serverHasRealPlayers from "./serverHasRealPlayers";
import hasGameOnTheServerStarted from "./hasGameOnTheServerStarted";

const getFirstStuckBot = async (storage) => {
  const contractPlayers = storage.player.valueMap;
  const contractServers = storage.server.valueMap;
  const contractRooms = storage.room.valueMap;

  const isBotStuck = (bot) => {
    // Checking if a bot is registered in the contract (in the waiting room or playing)
    const isBotInContract = contractPlayers.has(`"${bot.address}"`);
    if (!isBotInContract) return false;

    // Getting server name of the server where the bot is located
    const botsServerName = contractPlayers.get(`"${bot.address}"`)?.room_id;

    // Checking if the game on a selected server has already started
    if (hasGameOnTheServerStarted(contractRooms, botsServerName)) return false;

    // Getting players of a selected server
    const botsServerPlayers = contractServers.get(
      `"${botsServerName}"`
    )?.players;

    // Checking if a selected server has real players
    if (serverHasRealPlayers(botsServerPlayers)) return false;

    return true;
  };

  const BOTS = getBots();

  return BOTS.find(isBotStuck);
};

export default getFirstStuckBot;
