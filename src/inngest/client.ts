// src/inngest/client.ts
import { Inngest } from "inngest";

// NOTE: @inngest/realtime (0.4.7, latest) still depends on inngest@^3.42.3 and
// exports middleware as an instance, while inngest@4 expects a class. Until the
// realtime package ships v4 support, live node status is delivered by polling
// the Execution record instead — see features/executions/hooks/use-node-status.
export const inngest = new Inngest({ id: "knit" });
