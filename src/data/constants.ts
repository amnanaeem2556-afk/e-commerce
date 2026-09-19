import { Order } from '../types';
import { PRODUCTS } from './products';

export function formatPKR(amount: number): string {
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

export const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
];

export const MOCK_PAST_ORDERS: Order[] = [
  {
    id: 'LUM-948201',
    customerName: 'Fatima Malik',
    email: 'fatima.malik@example.com',
    phone: '0300 8472910',
    shippingAddress: 'Villa 14, Phase 5 DHA, Lahore',
    orderDate: 'September 10, 2026',
    estimatedDelivery: 'September 13, 2026',
    status: 'shipped',
    paymentMethod: 'Easypaisa Mobile Wallet',
    subtotal: 104800,
    discount: 10480,
    shipping: 0,
    total: 94320,
    items: [
      {
        id: 'cart-1',
        product: PRODUCTS[0],
        selectedColor: 'Caramel',
        selectedSize: 'M',
        quantity: 1,
      },
      {
        id: 'cart-2',
        product: PRODUCTS[3],
        selectedColor: 'Mocha',
        selectedSize: 'S',
        quantity: 1,
      },
    ],
  },
  {
    id: 'LUM-839102',
    customerName: 'Hamza Tariq',
    email: 'hamza.t@example.com',
    phone: '0321 4455667',
    shippingAddress: 'Apartment 7B, Creek Marina, DHA Phase 8, Karachi',
    orderDate: 'September 9, 2026',
    estimatedDelivery: 'September 12, 2026',
    status: 'out_for_delivery',
    paymentMethod: '1Link Bank Transfer',
    subtotal: 129000,
    discount: 0,
    shipping: 0,
    total: 129000,
    items: [
      {
        id: 'cart-3',
        product: PRODUCTS[6],
        selectedColor: 'Espresso',
        selectedSize: '41mm',
        quantity: 1,
      },
    ],
  },
];

export const FAQS = [
  {
    id: 'faq-1',
    category: 'shipping',
    question: 'How does White-Glove courier delivery operate in Pakistan?',
    answer:
      'Orders across Lahore, Karachi, and Islamabad are dispatched via insured temperature-controlled luxury couriers (TCS VIP Fleet and Leopard Gold). Deliveries over PKR 15,000 are completely complimentary, packaged in our signature embossed presentation box with hand-tied satin ribbon.',
  },
  {
    id: 'faq-2',
    category: 'returns',
    question: 'What is Lumora’s 30-Day In-Home Trial policy?',
    answer:
      'We grant our patrons 30 calendar days to experience the drape, texture, and fit of their garments in the comfort of their home. If you desire an exchange or return, our courier will pick up the parcel directly from your doorstep with zero return freight charges.',
  },
  {
    id: 'faq-3',
    category: 'payment',
    question: 'Which payment methods are accepted within Pakistan?',
    answer:
      'We accept Easypaisa (instant push confirmation), JazzCash mobile accounts, 1Link Direct Bank Transfer (Meezan Bank, Standard Chartered, and HBL), Visa, Mastercard, and Cash on Doorstep Delivery (COD).',
  },
  {
    id: 'faq-4',
    category: 'product',
    question: 'Where do you source your cashmere and silk?',
    answer:
      'Our cashmere is comb-harvested Grade-A Mongolian fleece with an ultra-fine 15.5-micron thickness. Our silk is woven in historic Como mills in Northern Italy with a heavyweight 22-momme drape.',
  },
  {
    id: 'faq-5',
    category: 'shipping',
    question: 'Can I request same-day courier dispatch?',
    answer:
      'Yes, for patrons residing in Lahore and Karachi metropolitan zones, same-day chauffeur handover is available at checkout for orders placed prior to 2:00 PM PKT.',
  },
  {
    id: 'faq-6',
    category: 'product',
    question: 'How do I choose the proper size for double-faced outerwear?',
    answer:
      'Our garments are cut with modern architectural ease. We recommend selecting your true standard luxury size. You can consult our interactive Size Guide or click "Need Help?" to chat directly with an atelier stylist.',
  },
];

export const PROMO_CODES: Record<string, { type: 'percent' | 'fixed'; value: number; description: string }> = {
  LUMORA10: { type: 'percent', value: 10, description: '10% Privileged Atelier Discount' },
  ELEGANCE20: { type: 'percent', value: 20, description: '20% Lumora Circle Exclusive' },
  WELCOME15: { type: 'percent', value: 15, description: '15% Welcome Privileges' },
};
