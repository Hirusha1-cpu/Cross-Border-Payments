import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WithdrawForm from '../components/withdraw/WithdrawForm';

export default function Withdraw() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-16 w-full">
        <h1 className="font-display text-3xl font-semibold text-paper mb-2">
          Withdraw to a bank account
        </h1>
        <p className="text-paper/60 mb-8">
          Escrowed on-chain, converted at the current rate, and paid out to a real
          bank account.
        </p>
        <div className="rounded-lg border border-ink-600 bg-ink-800 p-6">
          <WithdrawForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
