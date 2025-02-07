export default async function handler(req, res) {
    const { method } = req;

    if (method !== "GET") {
        res.setHeader("Allow", "GET");
        res.status(405).end(`Method ${method} Not Allowed`);
    }

    res.status(400).json({ error: "Provide a 'playerAddress' path parameter" });
}
