import { requestAddingBot } from "./requestAddingBot";

const recursivelyTryAddingBot = (bots = [], serverName = "NYC") => {
  return new Promise(async (resolve, reject) => {
    const randomBotIndex = Math.floor(Math.random() * bots.length);
    const bot = bots[randomBotIndex];
    bots.splice(randomBotIndex, 1);

    try {
      const hash = await requestAddingBot(bot, serverName);
      resolve(hash);
    } catch (error) {
      if (bots.length === 0) {
        reject(error);
        return;
      }

      try {
        const hash = await recursivelyTryAddingBot(bots, serverName);
        resolve(hash);
      } catch (err) {
        reject(err);
      }
    }
  });
};

export default recursivelyTryAddingBot;
