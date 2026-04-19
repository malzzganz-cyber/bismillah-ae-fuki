const BASE_URL = process.env.RUMAHOTP_BASE_URL || 'https://www.rumahotp.io';
const API_KEY = process.env.RUMAHOTP_API_KEY || '';

async function rumahOTPFetch(url: string) {
  const separator = url.includes('?') ? '&' : '?';
  const fullUrl = `${BASE_URL}${url}${separator}api_key=${API_KEY}`;
  const res = await fetch(fullUrl, {
    headers: { 'Accept': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`RumahOTP API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ─── DEPOSIT ────────────────────────────────────────────────────────────────
export async function createDeposit(amount: number) {
  return rumahOTPFetch(`/api/v2/deposit/create?amount=${amount}&payment_id=qris`);
}

export async function getDepositStatus(depositId: string) {
  return rumahOTPFetch(`/api/v2/deposit/get_status?deposit_id=${depositId}`);
}

export async function cancelDeposit(depositId: string) {
  return rumahOTPFetch(`/api/v1/deposit/cancel?deposit_id=${depositId}`);
}

// ─── ORDER / NOKOS ───────────────────────────────────────────────────────────
export async function getOperators(country?: string, providerId?: string) {
  let url = '/api/v2/operators?';
  if (country) url += `country=${country}&`;
  if (providerId) url += `provider_id=${providerId}&`;
  return rumahOTPFetch(url.replace(/&$/, ''));
}

export async function getServices() {
  return rumahOTPFetch('/api/v2/services');
}

export async function createOrder(serviceId: string, operatorId: string) {
  return rumahOTPFetch(`/api/v2/order?service_id=${serviceId}&operator_id=${operatorId}`);
}

export async function getOrderStatus(orderId: string) {
  return rumahOTPFetch(`/api/v1/orders/get_status?order_id=${orderId}`);
}

export async function cancelOrder(orderId: string) {
  return rumahOTPFetch(`/api/v1/orders/set_status?order_id=${orderId}&status=cancel`);
}

// ─── ADMIN ───────────────────────────────────────────────────────────────────
export async function getAdminBalance() {
  return rumahOTPFetch('/api/v1/user/balance');
}

// ─── MARKUP ──────────────────────────────────────────────────────────────────
export function applyMarkup(price: number): number {
  return price + (price <= 15000 ? 500 : 1000);
}
