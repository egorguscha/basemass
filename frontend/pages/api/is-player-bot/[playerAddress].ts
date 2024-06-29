import isPlayerBot from "@/services/addBot/infra/isPlayerBot";

export default async function handler(req, res) {
  const { query, method } = req;
  const { playerAddress } = query;

  if (method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).end(`Method ${method} Not Allowed`);
    return;
  }

  const isBot = await isPlayerBot(playerAddress);

  res.status(200).json({ playerAddress, isBot });
}
