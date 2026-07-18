import { useCallback, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS } from '../utils/constants';
import { ERC20_ABI, ESCROW_ABI } from '../utils/abi';
import { parseUsdc } from '../utils/helpers';
import { submitWithdrawal } from '../utils/api';
import { TX_STATUS } from '../utils/constants';

export function useWithdraw() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [escrowId, setEscrowId] = useState(null);

  const reset = useCallback(() => {
    setStatus(null);
    setError(null);
    setEscrowId(null);
  }, []);

  const withdraw = useCallback(async ({ amount, currency, bank, accountNumber }) => {
    setError(null);
    if (!window.ethereum) {
      setError('Connect a wallet first.');
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const senderAddress = await signer.getAddress();

      const usdc = new ethers.Contract(CONTRACTS.USDC, ERC20_ABI, signer);
      const escrow = new ethers.Contract(CONTRACTS.ESCROW, ESCROW_ABI, signer);
      const parsedAmount = parseUsdc(amount);

      setStatus(TX_STATUS.PENDING);

      // Escrow.sol pulls funds via transferFrom, so approval must cover the full amount
      const allowance = await usdc.allowance(senderAddress, CONTRACTS.ESCROW);
      if (allowance.lt(parsedAmount)) {
        const approveTx = await usdc.approve(CONTRACTS.ESCROW, parsedAmount);
        await approveTx.wait();
      }

      // Receiver is the platform's payout wallet — same address escrow releases to
      // before the off-chain bank transfer is triggered.
      const payoutReceiver = process.env.NEXT_PUBLIC_PAYOUT_ADDRESS || senderAddress;
      const escrowTx = await escrow.createEscrow(payoutReceiver, parsedAmount);
      const receipt = await escrowTx.wait();

      const createdEvent = receipt.events?.find((e) => e.event === 'EscrowCreated');
      const newEscrowId = createdEvent?.args?.id?.toString() ?? null;
      setEscrowId(newEscrowId);
      setStatus(TX_STATUS.ESCROWED);

      setStatus(TX_STATUS.PROCESSING);
      await submitWithdrawal({
        escrowId: newEscrowId,
        amount,
        currency,
        bank,
        accountNumber,
        senderAddress,
      });

      setStatus(TX_STATUS.COMPLETE);
    } catch (err) {
      console.error(err);
      setError(err?.reason || err?.message || 'Withdrawal failed.');
      setStatus(TX_STATUS.FAILED);
    }
  }, []);

  return { withdraw, status, error, escrowId, reset };
}
