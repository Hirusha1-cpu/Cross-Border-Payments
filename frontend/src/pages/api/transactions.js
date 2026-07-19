import { ethers } from 'ethers';
import axios from 'axios';
import { CONTRACTS } from '../../utils/constants';
import { ESCROW_ABI } from '../../utils/abi';

const ETHERSCAN_API = 'https://api.etherscan.io/v2/api'; // ← V2 unified endpoint
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
const SEPOLIA_CHAIN_ID = 11155111;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ error: 'address is required' });
  }

  try {
    const iface = new ethers.utils.Interface(ESCROW_ABI);
    const topic0 = iface.getEventTopic('EscrowCreated');

    const { data } = await axios.get(ETHERSCAN_API, {
      params: {
        chainid: SEPOLIA_CHAIN_ID, // ← V2 එකට අනිවාර්යයෙන්ම මේක ඕන
        module: 'logs',
        action: 'getLogs',
        fromBlock: 0,
        toBlock: 'latest',
        address: CONTRACTS.ESCROW,
        topic0,
        apikey: ETHERSCAN_API_KEY,
      },
    });

    if (data.status !== '1' && data.message !== 'No records found') {
      throw new Error(data.result || data.message);
    }

    const logs = Array.isArray(data.result) ? data.result : [];
    const lowerAddress = address.toLowerCase();

    const transactions = logs
      .map((log) => {
        const parsed = iface.parseLog({ topics: log.topics, data: log.data });
        return {
          escrowId: parsed.args.id.toString(),
          sender: parsed.args.sender,
          receiver: parsed.args.receiver,
          amount: ethers.utils.formatUnits(parsed.args.amount, 6),
          currency: 'USDC',
          status: 'escrowed',
          timestamp: parseInt(log.timeStamp, 16),
        };
      })
      .filter(
        (tx) =>
          tx.sender.toLowerCase() === lowerAddress ||
          tx.receiver.toLowerCase() === lowerAddress
      )
      .sort((a, b) => b.timestamp - a.timestamp);

    res.status(200).json(transactions);
  } catch (err) {
    console.error('transactions handler failed', err?.response?.data || err.message);
    res.status(502).json({ error: 'Unable to fetch transaction history' });
  }
}