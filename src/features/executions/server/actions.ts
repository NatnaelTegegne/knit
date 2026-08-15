'use server';

/**
 * Realtime subscription tokens are not used at present.
 *
 * @inngest/realtime (0.4.7, latest) still depends on inngest@^3.42.3 and exports
 * its middleware as an instance, while inngest@4 expects a class constructor —
 * so the realtime middleware cannot be registered on this client. Live node
 * status is delivered by polling the Execution record instead; see
 * features/executions/hooks/use-node-status.ts.
 *
 * When the realtime package ships inngest@4 support, reinstate the middleware
 * on the client and mint a channel-scoped token here after checking that the
 * caller owns the workflow.
 */
export {};
