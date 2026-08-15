// Sentinel meaning "run this workflow for every Stripe event"
export const STRIPE_ANY_EVENT = '*';

// Curated list of the Stripe events most workflows care about.
// Stripe sends many more; the "*" option covers those.
export const STRIPE_EVENT_TYPES = [
  'checkout.session.completed',
  'checkout.session.expired',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.succeeded',
  'charge.refunded',
  'charge.dispute.created',
  'customer.created',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
] as const;

export type StripeEventType = (typeof STRIPE_EVENT_TYPES)[number];

// Shape of the Stripe trigger node's `data` blob
export interface StripeTriggerData {
  variableName?: string;
  // A value from STRIPE_EVENT_TYPES, or STRIPE_ANY_EVENT
  eventType?: string;
}

/**
 * Does an incoming Stripe event match what the trigger node is configured for?
 * An unset filter is treated as "any event" so a freshly dropped node still fires.
 */
export function matchesStripeEventFilter(
  filter: string | undefined,
  incomingEventType: string
): boolean {
  if (!filter || filter === STRIPE_ANY_EVENT) return true;
  return filter === incomingEventType;
}
