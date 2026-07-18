import { useWalletContext } from '../../context/WalletContext';
import { formatUsdc } from '../../utils/helpers';

export default function BalanceDisplay() {
  const { address, balance } = useWalletContext();

  return (
    <div className="rounded-lg border border-ink-600 bg-ink-800 p-6 ledger-bg">
      <p className="text-xs font-mono uppercase tracking-widest text-paper/50 mb-2">
        Available balance
      </p>
      {address ? (
        <p className="font-mono text-4xl text-gold-400 mono-tabular">
          {balance ? formatUsdc(balance) : '—'}
          <span className="text-lg text-paper/50 ml-2">USDC</span>
        </p>
      ) : (
        <p className="text-paper/50 text-sm">Connect a wallet to see your balance.</p>
      )}
    </div>
  );
}
