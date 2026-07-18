import { TX_STATUS } from '../../utils/constants';

const STEPS = [
  { key: TX_STATUS.PENDING, label: 'Wallet' },
  { key: TX_STATUS.ESCROWED, label: 'Escrow' },
  { key: TX_STATUS.PROCESSING, label: 'Processor' },
  { key: TX_STATUS.COMPLETE, label: 'Bank' },
];

export default function InstantStatus({ status, error, escrowId }) {
  if (!status) return null;

  const currentIndex = STEPS.findIndex((s) => s.key === status);
  const failed = status === TX_STATUS.FAILED;

  return (
    <div className="rounded-lg border border-ink-600 bg-ink-800 p-6">
      <div className="flex items-center justify-between mb-2">
        {STEPS.map((step, i) => {
          const reached = !failed && i <= currentIndex;
          return (
            <div key={step.key} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`h-3 w-3 rounded-full transition-colors ${
                    reached ? 'bg-gold-500' : 'bg-ink-600'
                  }`}
                />
                <span
                  className={`mt-2 text-[11px] font-mono uppercase tracking-wider ${
                    reached ? 'text-paper' : 'text-paper/40'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 -mt-5 ${reached ? 'bg-gold-500' : 'bg-ink-600'}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-sm">
        {failed && <p className="text-rust">Transfer failed: {error}</p>}
        {status === TX_STATUS.COMPLETE && (
          <p className="text-mint-500">
            Complete — escrow #{escrowId} settled and payout sent to the bank.
          </p>
        )}
        {!failed && status !== TX_STATUS.COMPLETE && (
          <p className="text-paper/60">
            {status === TX_STATUS.PENDING && 'Waiting for wallet confirmation…'}
            {status === TX_STATUS.ESCROWED && `Escrow #${escrowId} created, handing off to processor…`}
            {status === TX_STATUS.PROCESSING && 'Bank payout in progress…'}
          </p>
        )}
      </div>
    </div>
  );
}
