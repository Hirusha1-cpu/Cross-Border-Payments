import { SAMPLE_BANKS } from '../../utils/constants';

export default function BankSelector({ currency, bank, onBankChange, accountNumber, onAccountChange }) {
  const banks = SAMPLE_BANKS[currency] || [];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-paper/50 mb-2">
          Receiving bank
        </label>
        <select
          value={bank}
          onChange={(e) => onBankChange(e.target.value)}
          className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2.5 text-paper text-sm focus:border-gold-500 outline-none"
        >
          <option value="">Select a bank</option>
          {banks.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-paper/50 mb-2">
          Account number
        </label>
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => onAccountChange(e.target.value)}
          placeholder="0000 0000 0000"
          className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2.5 text-paper text-sm font-mono focus:border-gold-500 outline-none placeholder:text-paper/30"
        />
      </div>
    </div>
  );
}
