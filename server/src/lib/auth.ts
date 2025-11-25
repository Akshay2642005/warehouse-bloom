import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI, organization } from "better-auth/plugins";
import prisma from "./prisma.js";


const clientOrigin = process.env.CLIENT_ORIGIN?.split(",") || ["http://localhost:8080"];
const serverOrigin = process.env.SERVER_ORIGIN?.split(",") || ["http://localhost:4000"];
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production with SMTP
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  plugins: [
    openAPI(),
    organization({
      async sendInvitationEmail(data) {
        // TODO: Implement email sending
        console.log("Invitation email:", data);
      },
      allowUserToCreateOrganization: true,
    }),
  ],
  trustedOrigins: [...clientOrigin, ...serverOrigin],
  secret: process.env.BETTER_AUTH_SECRET || "secret-key-min-32-chars",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
});

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];
