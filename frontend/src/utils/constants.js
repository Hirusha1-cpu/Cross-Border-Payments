import { ethers } from 'ethers';

export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111);
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || '';

export const CONTRACTS = {
  ESCROW: process.env.NEXT_PUBLIC_ESCROW_ADDRESS 
    ? ethers.utils.getAddress(process.env.NEXT_PUBLIC_ESCROW_ADDRESS) 
    : '',
  BRIDGE: process.env.NEXT_PUBLIC_BRIDGE_ADDRESS 
    ? ethers.utils.getAddress(process.env.NEXT_PUBLIC_BRIDGE_ADDRESS) 
    : '',
  PAYMENT_PROCESSOR: process.env.NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS 
    ? ethers.utils.getAddress(process.env.NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS) 
    : '',
  PRICE_ORACLE: process.env.NEXT_PUBLIC_PRICE_ORACLE_ADDRESS 
    ? ethers.utils.getAddress(process.env.NEXT_PUBLIC_PRICE_ORACLE_ADDRESS) 
    : '',
  USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS 
    ? ethers.utils.getAddress(process.env.NEXT_PUBLIC_USDC_ADDRESS) 
    : '',
};

export const USDC_DECIMALS = 6;
export const ESCROW_FEE_BPS = 10;

export const SUPPORTED_CURRENCIES = [
  { code: 'LKR', label: 'Sri Lankan Rupee', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'EUR', label: 'Euro', country: 'Eurozone', flag: '🇪🇺' },
  { code: 'GBP', label: 'British Pound', country: 'United Kingdom', flag: '🇬🇧' },
  { code: 'USD', label: 'US Dollar', country: 'United States', flag: '🇺🇸' },
];

export const SAMPLE_BANKS = {
  LKR: ['Commercial Bank of Ceylon', 'Sampath Bank', "People's Bank", 'HNB'],
  EUR: ['Deutsche Bank', 'BNP Paribas', 'ING'],
  GBP: ['Barclays', 'HSBC UK', 'Lloyds'],
  USD: ['Chase', 'Bank of America', 'Wells Fargo'],
};

export const TX_STATUS = {
  PENDING: 'pending',
  ESCROWED: 'escrowed',
  PROCESSING: 'processing',
  COMPLETE: 'complete',
  FAILED: 'failed',
};