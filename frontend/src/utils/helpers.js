import { ethers } from 'ethers';
import { USDC_DECIMALS, ESCROW_FEE_BPS } from './constants';

export function formatUsdc(rawAmount) {
  if (rawAmount === undefined || rawAmount === null) return '0.00';
  return Number(ethers.utils.formatUnits(rawAmount, USDC_DECIMALS)).toFixed(2);
}

export function parseUsdc(amount) {
  return ethers.utils.parseUnits(String(amount || '0'), USDC_DECIMALS);
}

export function shortenAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Mirrors the fee math in Escrow.sol: fee = (amount * FEE) / 10000
export function calculateFee(amount) {
  const numeric = Number(amount) || 0;
  const fee = (numeric * ESCROW_FEE_BPS) / 10000;
  return {
    fee,
    netAmount: numeric - fee,
  };
}

export function convertToLocal(usdcAmount, rate) {
  // PriceOracle rates are stored scaled; adjust divisor to match your oracle's scaling factor
  const numeric = Number(usdcAmount) || 0;
  const numericRate = Number(rate) || 0;
  return numeric * numericRate;
}

export function formatCurrency(value, currencyCode) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${Number(value).toFixed(2)} ${currencyCode}`;
  }
}

export function timeAgo(timestampSeconds) {
  const diff = Date.now() / 1000 - Number(timestampSeconds);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
