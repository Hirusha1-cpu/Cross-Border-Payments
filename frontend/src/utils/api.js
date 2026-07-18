import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

export async function fetchRates() {
  const { data } = await client.get('/rates');
  return data;
}

export async function fetchTransactions(address) {
  const { data } = await client.get('/transactions', { params: { address } });
  return data;
}

export async function submitWithdrawal(payload) {
  const { data } = await client.post('/withdraw', payload);
  return data;
}

export default client;
