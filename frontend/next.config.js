/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    NEXT_PUBLIC_ESCROW_ADDRESS: process.env.NEXT_PUBLIC_ESCROW_ADDRESS,
    NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS: process.env.NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS,
    NEXT_PUBLIC_PRICE_ORACLE_ADDRESS: process.env.NEXT_PUBLIC_PRICE_ORACLE_ADDRESS,
    NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS,
  },
};

module.exports = nextConfig;