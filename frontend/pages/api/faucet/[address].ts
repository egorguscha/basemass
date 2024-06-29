import sendTestnetTEZ from "@/services/faucet/sendTestnetTEZ";

export default async function handler(req, res) {
  const { query, method } = req;
  const { address } = query;

  if (method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end(`Method ${method} Not Allowed`);
    return;
  }

  console.log(`Requesting a ghostnet TEZ for ${address}`);
  try {
    const operationHash = await sendTestnetTEZ(address);
    res.status(201).json({ operationHash });
    console.log(
      `Successfully sent ghostnet TEZ for ${address}. Operation hash: ${operationHash}`
    );
  } catch (error) {
    res.status(error.status).json(error.json);
    console.log(
      `Error sending ghostnet TEZ for ${address}. Status: ${
        error.status
      }, ${JSON.stringify(error.json)}`
    );
  }
}
