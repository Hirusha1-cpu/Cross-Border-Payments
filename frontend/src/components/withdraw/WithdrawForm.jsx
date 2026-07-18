import { useEffect, useState } from 'react';
import { useWalletContext } from '../../context/WalletContext';
import { useWithdraw } from '../../hooks/useWithdraw';
import { fetchRates } from '../../utils/api';
import { formatUsdc } from '../../utils/helpers';
import CurrencySelector from './CurrencySelector';
import BankSelector from './BankSelector';
import FeeSummary from './FeeSummary';
import InstantStatus from './InstantStatus';
import Button from '../common/Button';
import { TX_STATUS } from '../../utils/constants';

export default function WithdrawForm() {
  const { address, balance, connect } = useWalletContext();
  const { withdraw, status, error, escrowId, reset } = useWithdraw();

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('LKR');
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [rate, setRate] = useState(null);

  useEffect(() => {
    fetchRates()
      .then((rates) => setRate(rates?.[currency] ?? null))
      .catch(() => setRate(null));
  }, [currency]);

  const isBusy = status && status !== TX_STATUS.COMPLETE && status !== TX_STATUS.FAILED;
  const canSubmit =
    address && Number(amount) > 0 && bank && accountNumber && !isBusy;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    await withdraw({ amount, currency, bank, accountNumber });
  };

  const handleReset = () => {
    reset();
    setAmount('');
    setBank('');
    setAccountNumber('');
  };

  if (status === TX_STATUS.COMPLETE || status === TX_STATUS.FAILED) {
    return (
      <div className="space-y-4">
        <InstantStatus status={status} error={error} escrowId={escrowId} />
        <Button variant="secondary" onClick={handleReset}>
          Start another withdrawal
        </Button>
      </div>
    );
  }

  if (isBusy) {
    return <InstantStatus status={status} error={error} escrowId={escrowId} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-mono uppercase tracking-widest text-paper/50">
            Amount (USDC)
          </label>
          {address && balance && (
            <button
              type="button"
              onClick={() => setAmount(formatUsdc(balance))}
              className="text-xs text-gold-400 hover:text-gold-300"
            >
              Use max
            </button>
          )}
        </div>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-md border border-ink-600 bg-ink-800 px-4 py-3 text-2xl font-mono text-paper focus:border-gold-500 outline-none placeholder:text-paper/30"
        />
      </div>

      <CurrencySelector value={currency} onChange={setCurrency} />

      <BankSelector
        currency={currency}
        bank={bank}
        onBankChange={setBank}
        accountNumber={accountNumber}
        onAccountChange={setAccountNumber}
      />

      {Number(amount) > 0 && <FeeSummary amount={amount} currency={currency} rate={rate} />}

      {!address ? (
        <Button type="button" onClick={connect} className="w-full">
          Connect wallet to continue
        </Button>
      ) : (
        <Button type="submit" disabled={!canSubmit} className="w-full">
          Withdraw to bank
        </Button>
      )}
    </form>
  );
}
