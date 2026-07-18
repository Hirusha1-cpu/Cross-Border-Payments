import { useState } from 'react';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import BalanceDisplay from '../components/wallet/BalanceDisplay';
import Button from '../components/common/Button';
import { useWalletContext } from '../context/WalletContext';
import { CONTRACTS } from '../utils/constants';
import { ERC20_ABI } from '../utils/abi';
import { parseUsdc, shortenAddress } from '../utils/helpers';

export default function Deposit() {
  const { address, connect, refreshBalance } = useWalletContext();
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!address || !window.ethereum || Number(amount) <= 0) return;
    setSending(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const usdc = new ethers.Contract(CONTRACTS.USDC, ERC20_ABI, signer);
      const tx = await usdc.transfer(CONTRACTS.ESCROW, parseUsdc(amount));
      await tx.wait();
      toast.success(`Deposited ${amount} USDC`);
      setAmount('');
      await refreshBalance(address);
    } catch (err) {
      toast.error(err?.reason || err?.message || 'Deposit failed.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-16 w-full">
        <h1 className="font-display text-3xl font-semibold text-paper mb-2">Deposit USDC</h1>
        <p className="text-paper/60 mb-8">
          Funds deposited here become the balance you can send cross-border from the
          Withdraw page.
        </p>

        <div className="mb-6">
          <BalanceDisplay />
        </div>

        <form onSubmit={handleDeposit} className="rounded-lg border border-ink-600 bg-ink-800 p-6 space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-paper/50 mb-2">
              Amount (USDC)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-md border border-ink-600 bg-ink-900 px-4 py-3 text-2xl font-mono text-paper focus:border-gold-500 outline-none placeholder:text-paper/30"
            />
          </div>

          {address ? (
            <>
              <p className="text-xs text-paper/40 font-mono">
                Sending from {shortenAddress(address)}
              </p>
              <Button type="submit" loading={sending} disabled={Number(amount) <= 0} className="w-full">
                Deposit
              </Button>
            </>
          ) : (
            <Button type="button" onClick={connect} className="w-full">
              Connect wallet to deposit
            </Button>
          )}
        </form>
      </main>
      <Footer />
    </div>
  );
}
