import { BOT_WAITING_DELAYS } from "../../constants";

export const getLatestJoinedPlayer = (waitRoom) => {
  let latestJoinedPlayer;

  if (waitRoom.length === 1) {
    latestJoinedPlayer = waitRoom[0];
  } else {
    latestJoinedPlayer = waitRoom.reduce((prevPlayer, currPlayer) => {
      const prevPlayerEntryBlock = prevPlayer.entry_block.toNumber();
      const currPlayerEntryBlock = currPlayer.entry_block.toNumber();

      if (prevPlayerEntryBlock >= currPlayerEntryBlock) {
        return prevPlayer;
      }
      return currPlayer;
    });
  }

  return latestJoinedPlayer;
};

export const getBotAdditionDelay = async (
  waitRoom,
  latestJoinedPlayerBlockDatetime: number
) => {
  if (!waitRoom || waitRoom.length === 0) {
    throw new Error("waitRoom is empty or not initialized");
  }

  // Checking which of the players in the waiting room has the largest entry_block ...
  // .. value - this will be the most recently joined player

  // Fetching the block timestamp - this will be the most recent player's joining timestamp

  const latestJoinedTimestamp = new Date(
    latestJoinedPlayerBlockDatetime
  ).getTime();

  const currentTimestamp = Date.now();

  // Calculating the amount of bots on a current server
  const currentServerBotsCount = waitRoom.reduce((accumulator, player) => {
    if (player.isBot) {
      return accumulator + 1;
    } else {
      return accumulator;
    }
  }, 0);

  // Calculating whether minimum bot joining time have passed since the last player joined

  const timeElapsedSinceLastJoin = currentTimestamp - latestJoinedTimestamp;

  const currBotMinJoinTime = BOT_WAITING_DELAYS[currentServerBotsCount];

  if (timeElapsedSinceLastJoin < currBotMinJoinTime) {
    return currBotMinJoinTime - timeElapsedSinceLastJoin;
  } else {
    return 0;
  }
};
