import { calculateFee, convertToLocal, formatCurrency } from '../../utils/helpers';

export default function FeeSummary({ amount, currency, rate }) {
  const { fee, netAmount } = calculateFee(amount);
  const localAmount = rate ? convertToLocal(netAmount, rate) : null;

  const rows = [
    { label: 'You send', value: `${Number(amount || 0).toFixed(2)} USDC` },
    { label: 'Network fee (0.1%)', value: `-${fee.toFixed(4)} USDC` },
    { label: 'Net escrowed', value: `${netAmount.toFixed(4)} USDC` },
  ];

  return (
    <div className="rounded-lg border border-ink-600 bg-ink-800 p-5 space-y-3">
      <p className="text-xs font-mono uppercase tracking-widest text-paper/50">Breakdown</p>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between text-sm">
          <span className="text-paper/60">{row.label}</span>
          <span className="font-mono text-paper mono-tabular">{row.value}</span>
        </div>
      ))}
      <div className="border-t border-ink-600 pt-3 flex items-center justify-between">
        <span className="text-sm text-paper/60">Receiver gets</span>
        <span className="font-mono text-lg text-gold-400 mono-tabular">
          {localAmount !== null ? formatCurrency(localAmount, currency) : '—'}
        </span>
      </div>
    </div>
  );
}
