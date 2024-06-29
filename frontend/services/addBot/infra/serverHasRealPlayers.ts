import isPlayerBot from "./isPlayerBot";

const serverHasRealPlayers = (serverPlayers) => {
    for (const playerAddress of serverPlayers) {
        if (!isPlayerBot(playerAddress)) {
            return true;
        };
    };

    return false;
};

export default serverHasRealPlayers;
