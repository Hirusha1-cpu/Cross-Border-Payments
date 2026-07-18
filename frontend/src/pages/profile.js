import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useWalletContext } from '../context/WalletContext';
import { shortenAddress, formatUsdc } from '../utils/helpers';

export default function Profile() {
  const { address, balance } = useWalletContext();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-16 w-full">
        <h1 className="font-display text-3xl font-semibold text-paper mb-8">Profile</h1>

        {!address ? (
          <p className="text-paper/50">Connect a wallet to view your profile.</p>
        ) : (
          <div className="rounded-lg border border-ink-600 bg-ink-800 divide-y divide-ink-700">
            <Row label="Wallet address" value={address} mono />
            <Row label="Short form" value={shortenAddress(address)} mono />
            <Row label="USDC balance" value={balance ? `${formatUsdc(balance)} USDC` : '—'} mono />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <span className="text-xs font-mono uppercase tracking-widest text-paper/50">{label}</span>
      <span className={`text-paper text-sm ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
