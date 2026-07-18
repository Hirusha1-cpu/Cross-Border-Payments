import Link from 'next/link';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import BalanceDisplay from '../components/wallet/BalanceDisplay';
import Button from '../components/common/Button';
import { SUPPORTED_CURRENCIES } from '../utils/constants';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-6 w-full">
        {/* Hero */}
        <section className="pt-20 pb-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-500 mb-4">
              USDC in → local currency out
            </p>
            <h1 className="font-display text-5xl font-semibold leading-tight text-paper">
              Send value across borders,
              <span className="text-gold-400"> settle in hours</span>, not days.
            </h1>
            <p className="mt-5 text-paper/60 text-lg leading-relaxed">
              Deposit USDC, escrow it on-chain, and Meridian converts and pays out to a
              real bank account — Colombo to Frankfurt, on a route you can watch move.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/withdraw">
                <Button>Start a withdrawal</Button>
              </Link>
              <Link href="/deposit">
                <Button variant="secondary">Deposit USDC</Button>
              </Link>
            </div>
          </div>

          <BalanceDisplay />
        </section>

        {/* Signature element: the settlement route strip */}
        <section className="pb-20">
          <p className="font-mono text-xs uppercase tracking-widest text-paper/50 mb-4">
            Where Meridian settles
          </p>
          <div className="rounded-lg border border-ink-600 bg-ink-800 ledger-bg overflow-hidden">
            <div className="flex items-center gap-0 overflow-x-auto">
              <RouteNode label="Wallet" sub="USDC escrow" active />
              <RouteLine />
              <RouteNode label="Bridge" sub="L1 → L2" />
              <RouteLine />
              <RouteNode label="Processor" sub="rate lock" />
              <RouteLine />
              {SUPPORTED_CURRENCIES.map((c, i) => (
                <div key={c.code} className="flex items-center">
                  <RouteNode label={c.code} sub={c.country} flag={c.flag} />
                  {i < SUPPORTED_CURRENCIES.length - 1 && <RouteLine faint />}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function RouteNode({ label, sub, flag, active }) {
  return (
    <div className="flex-shrink-0 px-6 py-6 min-w-[140px]">
      <div
        className={`h-2 w-2 rounded-full mb-3 ${active ? 'bg-gold-500' : 'bg-ink-600'}`}
        aria-hidden
      />
      <p className="font-mono text-sm text-paper">
        {flag && <span className="mr-1">{flag}</span>}
        {label}
      </p>
      <p className="text-xs text-paper/40">{sub}</p>
    </div>
  );
}

function RouteLine({ faint }) {
  return (
    <div
      className={`h-px flex-shrink-0 w-8 ${faint ? 'bg-ink-600' : 'bg-gold-500/40'}`}
      aria-hidden
    />
  );
}
