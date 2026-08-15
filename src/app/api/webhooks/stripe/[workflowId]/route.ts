import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { inngest } from '@/inngest/client';
import { NodeType } from '@/generated/prisma/enums';
import {
  matchesStripeEventFilter,
  type StripeTriggerData,
} from '@/features/triggers/lib/stripe-events';
import { verifyStripeSignature } from '@/features/triggers/lib/stripe-signature';

// Signing secret from the Stripe dashboard for this endpoint (whsec_...)
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Minimal shape we rely on from a Stripe event envelope
interface StripeEvent {
  id: string;
  type: string;
  created: number;
  data: { object: unknown };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params;

  // Fail closed: without a signing secret every caller would look authentic
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    );
  }

  // The signature covers the exact bytes Stripe sent, so read the body as text
  // and only parse it after verification passes.
  const rawBody = await request.text();

  const verification = verifyStripeSignature(
    rawBody,
    request.headers.get('stripe-signature'),
    STRIPE_WEBHOOK_SECRET
  );

  if (!verification.ok) {
    console.warn(`Stripe webhook rejected: ${verification.reason}`);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let event: StripeEvent;
    try {
      event = JSON.parse(rawBody) as StripeEvent;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!event?.type) {
      return NextResponse.json(
        { error: 'Missing event type' },
        { status: 400 }
      );
    }

    // Find the workflow and its Stripe trigger nodes
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        nodes: {
          where: { type: NodeType.STRIPE_TRIGGER },
        },
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    if (workflow.nodes.length === 0) {
      return NextResponse.json(
        { error: 'Workflow does not have a Stripe trigger' },
        { status: 400 }
      );
    }

    // Only run when the event matches the node's configured filter. Anything
    // else gets a 200 so Stripe doesn't retry an event we deliberately skipped.
    const matches = workflow.nodes.some((node) =>
      matchesStripeEventFilter(
        (node.data as StripeTriggerData)?.eventType,
        event.type
      )
    );

    if (!matches) {
      return NextResponse.json({
        success: true,
        message: 'Event ignored (does not match trigger filter)',
        eventType: event.type,
      });
    }

    await inngest.send({
      name: 'workflow/execute',
      data: {
        workflowId: workflow.id,
        userId: workflow.userId,
        triggerData: {
          type: 'stripe',
          stripeEvent: {
            id: event.id,
            type: event.type,
            created: event.created,
            data: event.data,
          },
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Workflow execution triggered',
      workflowId,
      eventType: event.type,
    });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
