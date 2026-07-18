// Trimmed ABIs — only the functions/events the frontend actually calls.
// Keep these in sync with contracts/contracts/**/*.sol

export const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

export const ESCROW_ABI = [
  'function createEscrow(address receiver, uint256 amount) returns (uint256)',
  'function releaseFunds(uint256 escrowId)',
  'function refundFunds(uint256 escrowId)',
  'function getEscrow(uint256 escrowId) view returns (tuple(uint256 id, address sender, address receiver, uint256 amount, uint256 grossAmount, uint256 timestamp, bool released, bool refunded))',
  'function userTransactions(address user, uint256 index) view returns (uint256)',
  'event EscrowCreated(uint256 indexed id, address sender, address receiver, uint256 amount)',
  'event EscrowReleased(uint256 indexed id, address receiver, uint256 amount)',
  'event EscrowRefunded(uint256 indexed id, address sender, uint256 amount)',
];

export const PAYMENT_PROCESSOR_ABI = [
  'function createPayment(address receiver, uint256 amount, string currency) returns (uint256)',
  'function payments(uint256 id) view returns (tuple(uint256 id, address sender, address receiver, uint256 amount, string currency, uint256 timestamp, bool completed, bool failed))',
  'event PaymentCreated(uint256 indexed id, address sender, address receiver, uint256 amount)',
  'event PaymentCompleted(uint256 indexed id, address receiver, uint256 amount)',
  'event PaymentFailed(uint256 indexed id, string reason)',
];

export const PRICE_ORACLE_ABI = [
  'function getRate(string currency) view returns (uint256)',
  'function isRateValid(string currency) view returns (bool)',
  'function lastUpdate(string currency) view returns (uint256)',
];
