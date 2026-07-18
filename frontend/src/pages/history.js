import { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Spinner from '../components/common/Spinner';
import { useWalletContext } from '../context/WalletContext';
import { fetchTransactions } from '../utils/api';
import { timeAgo } from '../utils/helpers';

const STATUS_STYLES = {
  complete: 'text-mint-500 bg-mint-500/10',
  processing: 'text-gold-400 bg-gold-500/10',
  escrowed: 'text-gold-400 bg-gold-500/10',
  pending: 'text-paper/60 bg-ink-700',
  failed: 'text-rust bg-rust/10',
};

export default function History() {
  const { address } = useWalletContext();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetchTransactions(address)
      .then(setTransactions)
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [address]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        <h1 className="font-display text-3xl font-semibold text-paper mb-8">History</h1>

        {!address && <p className="text-paper/50">Connect a wallet to see your transfers.</p>}

        {address && loading && (
          <div className="flex items-center gap-2 text-paper/50">
            <Spinner size={18} /> Loading transfers…
          </div>
        )}

        {address && !loading && transactions.length === 0 && (
          <p className="text-paper/50">No transfers yet — your history will show up here.</p>
        )}

        {address && !loading && transactions.length > 0 && (
          <div className="rounded-lg border border-ink-600 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink-800 text-paper/50 font-mono text-xs uppercase tracking-widest">
                <tr>
                  <th className="text-left px-4 py-3">Escrow</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Currency</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.escrowId} className="border-t border-ink-700">
                    <td className="px-4 py-3 font-mono text-paper">#{tx.escrowId}</td>
                    <td className="px-4 py-3 font-mono text-paper mono-tabular">{tx.amount} USDC</td>
                    <td className="px-4 py-3 text-paper/70">{tx.currency}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-mono uppercase ${
                          STATUS_STYLES[tx.status] || STATUS_STYLES.pending
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-paper/50">{timeAgo(tx.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
