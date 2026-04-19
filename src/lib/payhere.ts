import crypto from 'crypto';

const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || '';
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || '';
const IS_SANDBOX = process.env.PAYHERE_SANDBOX === 'true';

export const PAYHERE_BASE_URL = IS_SANDBOX
  ? 'https://sandbox.payhere.lk/pay/checkout'
  : 'https://www.payhere.lk/pay/checkout';

export function generatePayHereHash(
  orderId: string,
  amount: number,
  currency: string = 'LKR'
): string {
  const formattedAmount = amount.toFixed(2);
  const innerHash = crypto
    .createHash('md5')
    .update(MERCHANT_SECRET)
    .digest('hex')
    .toUpperCase();

  const hash = crypto
    .createHash('md5')
    .update(
      MERCHANT_ID +
      orderId +
      formattedAmount +
      currency +
      innerHash
    )
    .digest('hex')
    .toUpperCase();

  return hash;
}

export function verifyPayHereNotification(params: {
  merchant_id: string;
  order_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
}): boolean {
  const innerHash = crypto
    .createHash('md5')
    .update(MERCHANT_SECRET)
    .digest('hex')
    .toUpperCase();

  const expectedSig = crypto
    .createHash('md5')
    .update(
      params.merchant_id +
      params.order_id +
      params.payhere_amount +
      params.payhere_currency +
      params.status_code +
      innerHash
    )
    .digest('hex')
    .toUpperCase();

  return expectedSig === params.md5sig;
}

export function getPayHereFormData(order: {
  id: string;
  totalPrice: number;
  deliveryName: string;
  deliveryPhone: string;
  deliveryAddress: string;
  userEmail: string;
}) {
  const hash = generatePayHereHash(order.id, order.totalPrice);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    merchant_id: MERCHANT_ID,
    return_url: `${baseUrl}/checkout/success?order_id=${order.id}`,
    cancel_url: `${baseUrl}/checkout?cancelled=true`,
    notify_url: `${baseUrl}/api/payment/notify`,
    order_id: order.id,
    items: 'Surprizo Mystery Box',
    currency: 'LKR',
    amount: order.totalPrice.toFixed(2),
    first_name: order.deliveryName.split(' ')[0] || order.deliveryName,
    last_name: order.deliveryName.split(' ').slice(1).join(' ') || '',
    email: order.userEmail,
    phone: order.deliveryPhone,
    address: order.deliveryAddress,
    city: 'Colombo',
    country: 'Sri Lanka',
    hash: hash,
  };
}
