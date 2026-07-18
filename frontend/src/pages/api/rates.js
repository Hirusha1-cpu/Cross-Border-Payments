import { ethers } from 'ethers';
import { CONTRACTS, RPC_URL, SUPPORTED_CURRENCIES } from '../../utils/constants';
import { PRICE_ORACLE_ABI } from '../../utils/abi';

// GET /api/rates
// Returns { LKR: 385, EUR: 1.08, ... } read live from PriceOracle.sol.
// NOTE: adjust the scaling divisor below to match however updateRate()
// stores values on-chain (the contract itself stores raw integers).
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const oracle = new ethers.Contract(CONTRACTS.PRICE_ORACLE, PRICE_ORACLE_ABI, provider);

    const entries = await Promise.all(
      SUPPORTED_CURRENCIES.map(async ({ code }) => {
        try {
          const valid = await oracle.isRateValid(code);
          if (!valid) return [code, null];
          const raw = await oracle.getRate(code);
          return [code, Number(raw) / 100]; // divide by the same scale updateRate() used
        } catch {
          return [code, null];
        }
      })
    );

    res.status(200).json(Object.fromEntries(entries));
  } catch (err) {
    console.error('rates handler failed', err);
    res.status(502).json({ error: 'Unable to reach PriceOracle' });
  }
}
