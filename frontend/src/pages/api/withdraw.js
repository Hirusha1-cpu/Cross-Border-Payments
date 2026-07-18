// POST /api/withdraw
// Called after the on-chain escrow is created. This is where you'd:
//   1. Persist the withdrawal request (escrowId, bank details, amount)
//   2. Call PaymentProcessor.createPayment() from a backend signer/keeper
//   3. Trigger the actual bank rail (Wise, Stripe Treasury, local PSP, etc.)
//   4. Have the keeper call completePayment()/failPayment() once the bank leg resolves
//
// This stub validates input and echoes an accepted response so the frontend
// flow is fully wireable; swap the TODO for real backend logic.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { escrowId, amount, currency, bank, accountNumber, senderAddress } = req.body || {};

  if (!escrowId || !amount || !currency || !bank || !accountNumber || !senderAddress) {
    return res.status(400).json({ error: 'Missing required withdrawal fields' });
  }

  // TODO: persist + kick off PaymentProcessor.createPayment() + bank payout
  res.status(202).json({
    accepted: true,
    escrowId,
    status: 'processing',
  });
}
