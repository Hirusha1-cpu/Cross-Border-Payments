export default function Footer() {
  return (
    <footer className="border-t border-ink-700 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-paper/50 font-mono">
        <span>Meridian — cross-border settlement, on-chain.</span>
        <span>Funds are held in audited escrow contracts. Not a bank.</span>
      </div>
    </footer>
  );
}
