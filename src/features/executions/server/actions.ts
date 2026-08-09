'use server';

// Note: Real-time subscriptions require additional Inngest realtime setup
// For now, status is shown after execution completes

/**
 * Placeholder for getting realtime subscription token
 * To be implemented with @inngest/realtime when fully configured
 */
export async function getWorkflowRealtimeToken(workflowId: string) {
  // Return null to indicate realtime is not available
  return null;
}
