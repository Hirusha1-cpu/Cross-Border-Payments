import { SUPPORTED_CURRENCIES } from '../../utils/constants';

export default function CurrencySelector({ value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-widest text-paper/50 mb-2">
        Payout currency
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SUPPORTED_CURRENCIES.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => onChange(c.code)}
            className={`rounded-md border px-3 py-3 text-left transition-colors ${
              value === c.code
                ? 'border-gold-500 bg-gold-500/10'
                : 'border-ink-600 bg-ink-800 hover:border-ink-500'
            }`}
          >
            <div className="text-lg">{c.flag}</div>
            <div className="font-mono text-sm text-paper">{c.code}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
