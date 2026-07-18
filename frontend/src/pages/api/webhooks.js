// POST /api/webhooks
// Receiving end for bank/PSP payout callbacks (e.g. "payout settled" or
// "payout failed"). On success this is where you'd call
// PaymentProcessor.completePayment(id); on failure, failPayment(id, reason).
//
// IMPORTANT: verify the webhook signature from your PSP before trusting
// the payload — this stub intentionally leaves that TODO explicit rather
// than skipping it silently.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // TODO: verify signature header from the payment provider here

  const { escrowId, event } = req.body || {};
  if (!escrowId || !event) {
    return res.status(400).json({ error: 'Missing escrowId or event' });
  }

  // TODO: on 'payout.settled' -> completePayment(escrowId)
  //       on 'payout.failed'  -> failPayment(escrowId, reason)

  res.status(200).json({ received: true });
}
