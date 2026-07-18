import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS } from '../utils/constants';
import { ERC20_ABI } from '../utils/abi';

export function useWallet() {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null); // raw USDC balance (BigNumber)
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const refreshBalance = useCallback(async (addr) => {
    if (!addr || !window.ethereum || !CONTRACTS.USDC) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const usdc = new ethers.Contract(CONTRACTS.USDC, ERC20_ABI, provider);
      const bal = await usdc.balanceOf(addr);
      setBalance(bal);
    } catch (err) {
      // Non-fatal — balance display just stays empty until next refresh
      console.error('Failed to fetch USDC balance', err);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('No wallet found. Install MetaMask or another injected wallet.');
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(accounts[0]);
      await refreshBalance(accounts[0]);
    } catch (err) {
      setError(err?.message || 'Connection was declined.');
    } finally {
      setConnecting(false);
    }
  }, [refreshBalance]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance(null);
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
        refreshBalance(accounts[0]);
      }
    };
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  }, [disconnect, refreshBalance]);

  return { address, balance, connecting, error, connect, disconnect, refreshBalance };
}
