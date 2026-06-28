import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { magicLink } from "better-auth/plugins/magic-link";
import { organization } from "better-auth/plugins/organization";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { Resend } from "resend";
import { db } from "~/db";
import { eq } from "drizzle-orm";
import * as schema from "~/db/schema";

import { plans, stripePlan } from "./plans";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const isDev = process.env.BETTER_AUTH_URL?.includes("localhost");
const toAddr = (email: string) => isDev ? "delivered@resend.dev" : email;

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", { apiVersion: "2026-06-24.dahlia" });

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (resend) {
        await resend.emails.send({ from: "Spire <noreply@synov8studio.com>", to: toAddr(user.email), subject: "Verify your email", html: `<a href="${url}">Verify email</a>` });
      } else {
        console.log(`[Email Verification] ${user.email}: ${url}`);
      }
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        if (resend) {
          await resend.emails.send({ from: "Spire <noreply@synov8studio.com>", to: toAddr(email), subject: "Sign in to Spire", html: `<a href="${url}">Sign in</a>` });
        } else {
          console.log(`[Magic Link] ${email}: ${url}`);
        }
      },
    }),
    organization({
      requireEmailVerificationOnInvitation: true,
      sendInvitationEmail: async (data) => {
        const link = `${process.env.BETTER_AUTH_URL}/accept-invitation/${data.id}`;
        if (resend) {
          await resend.emails.send({
            from: "Spire <noreply@synov8studio.com>",
            to: toAddr(data.email),
            subject: `You've been invited to join ${data.organization.name} on Spire`,
            html: `<p>${data.inviter.user.name} invited you to join <strong>${data.organization.name}</strong> on Spire.</p><p><a href="${link}">Accept invitation</a></p>`,
          });
        } else {
          console.log(`[Invitation] ${data.email}: ${link}`);
        }
      },
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder",
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: plans.map(stripePlan),
        authorizeReference: async ({ user, referenceId }) => {
          const members = await db.select().from(schema.member).where(eq(schema.member.organizationId, referenceId as string));
          const member = members.find((m) => m.userId === user.id);
          return member?.role === "owner" || member?.role === "admin";
        },
      },
      organization: { enabled: true },
    }),
  ],
});
