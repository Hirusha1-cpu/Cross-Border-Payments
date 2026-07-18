// GET /api/transactions?address=0x...
// Stub: swap this for a real query against whatever stores withdraw records
// (Postgres, a subgraph indexing EscrowCreated/EscrowReleased events, etc).
// Kept here so the frontend has a stable contract to build against.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ error: 'address is required' });
  }

  // TODO: replace with a real data source
  const transactions = [];

  res.status(200).json(transactions);
}
