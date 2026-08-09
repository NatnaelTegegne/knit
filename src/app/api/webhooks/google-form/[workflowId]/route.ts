import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { inngest } from '@/inngest/client';
import { NodeType } from '@/generated/prisma/enums';

// Shared secret for webhook authentication
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'default-webhook-secret';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params;

  // Verify webhook secret
  const secret = request.headers.get('x-webhook-secret');
  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Parse the form submission data
    const formData = await request.json();

    // Find the workflow and verify it has a Google Form trigger
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        nodes: {
          where: { type: NodeType.GOOGLE_FORM_TRIGGER },
        },
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    if (workflow.nodes.length === 0) {
      return NextResponse.json(
        { error: 'Workflow does not have a Google Form trigger' },
        { status: 400 }
      );
    }

    // Send event to Inngest to execute the workflow
    await inngest.send({
      name: 'workflow/execute',
      data: {
        workflowId: workflow.id,
        userId: workflow.userId,
        triggerData: {
          type: 'google-form',
          formResponse: formData,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Workflow execution triggered',
      workflowId,
    });
  } catch (error) {
    console.error('Google Form webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-webhook-secret',
    },
  });
}
