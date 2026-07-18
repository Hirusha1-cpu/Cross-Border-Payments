import { useWalletContext } from '../../context/WalletContext';
import { shortenAddress } from '../../utils/helpers';
import Button from '../common/Button';

export default function WalletConnect() {
  const { address, connect, disconnect, connecting, error } = useWalletContext();

  if (address) {
    return (
      <button
        onClick={disconnect}
        className="flex items-center gap-2 rounded-md border border-ink-600 px-3 py-2 text-sm font-mono text-paper hover:border-gold-500/60 transition-colors"
        title="Click to disconnect"
      >
        <span className="h-2 w-2 rounded-full bg-mint-500" />
        {shortenAddress(address)}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={connect} loading={connecting} variant="primary">
        Connect wallet
      </Button>
      {error && <span className="text-xs text-rust">{error}</span>}
    </div>
  );
}
