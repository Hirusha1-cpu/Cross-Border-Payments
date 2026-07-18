import Link from 'next/link';
import { useRouter } from 'next/router';
import WalletConnect from '../wallet/WalletConnect';

const LINKS = [
  { href: '/deposit', label: 'Deposit' },
  { href: '/withdraw', label: 'Withdraw' },
  { href: '/history', label: 'History' },
];

export default function Navbar() {
  const router = useRouter();

  return (
    <header className="border-b border-ink-700 bg-ink-950/80 backdrop-blur sticky top-0 z-20">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-display font-semibold text-lg text-paper">
          <span className="text-gold-500">◆</span>
          Meridian
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((link) => {
            const active = router.pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  active ? 'text-gold-400' : 'text-paper/70 hover:text-paper'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <WalletConnect />
      </nav>
    </header>
  );
}
