import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CHAIN_ID } from '../utils/constants';

// Thin wrapper around window.ethereum. Kept separate from useWallet so
// components that only need read access don't have to pull in connect logic.
export function useWeb3() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(web3Provider);

    web3Provider.getNetwork().then((network) => setChainId(network.chainId));

    const handleChainChanged = () => window.location.reload();
    window.ethereum.on('chainChanged', handleChainChanged);
    return () => window.ethereum.removeListener('chainChanged', handleChainChanged);
  }, []);

  const getSigner = useCallback(async () => {
    if (!provider) return null;
    const s = provider.getSigner();
    setSigner(s);
    return s;
  }, [provider]);

  const isWrongNetwork = chainId !== null && chainId !== CHAIN_ID;

  return { provider, signer, chainId, getSigner, isWrongNetwork };
}
