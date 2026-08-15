import { betterAuth, type BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/db";

/**
 * Only register a provider once both halves of its credentials are present.
 * Passing an undefined clientId would let the app boot and then fail at the
 * redirect, which is far harder to diagnose than a button that isn't there.
 */
function buildSocialProviders(): BetterAuthOptions["socialProviders"] {
    const providers: NonNullable<BetterAuthOptions["socialProviders"]> = {};

    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
        providers.github = {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        };
    }

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        providers.google = {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        };
    }

    return providers;
}

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true, //automatically logs the user in when they sign up
    },
    socialProviders: buildSocialProviders(),
    account: {
        accountLinking: {
            // Someone who signed up with email and later uses GitHub with the
            // same verified address gets the same account, not a duplicate.
            enabled: true,
            trustedProviders: ["github", "google"],
        },
    },
});
