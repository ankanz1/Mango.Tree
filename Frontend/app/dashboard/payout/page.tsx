import { Metadata } from 'next';
import PayoutPage from '@/components/dashboard/payout';

export const metadata: Metadata = {
  title: 'Payout - Mango Tree',
  description: 'Request payouts and view payout history',
};

export default function Page() {
  return <PayoutPage />;
}
