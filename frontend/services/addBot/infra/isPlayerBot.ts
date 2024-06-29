import { getBots } from "../../../staticData";

const isPlayerBot = async (address) => {
    const BOTS_SET = new Set((await getBots()).map((bot) => bot.address))
    return BOTS_SET.has(address);
}

export default isPlayerBot;
