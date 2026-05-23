import { httpRouter } from "convex/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

type ClerkWebhookEvent = {
    type: string;
    data: {
        id: string;
        first_name?: string;
        last_name?: string;
        email_addresses?: {
            email_address: string;
        }[];
    };
};

// =========================
// Clerk Webhook
// =========================
http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        try {
            const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

            if (!webhookSecret) {
                throw new Error("Missing CLERK_WEBHOOK_SECRET");
            }

            // Get Svix headers
            const svix_id = request.headers.get("svix-id");
            const svix_signature = request.headers.get("svix-signature");
            const svix_timestamp = request.headers.get("svix-timestamp");

            if (!svix_id || !svix_signature || !svix_timestamp) {
                return new Response("Missing svix headers", {
                    status: 400,
                });
            }

            // IMPORTANT:
            // Use raw body text for webhook verification
            const body = await request.text();

            // Create Svix webhook instance
            const wh = new Webhook(webhookSecret);

            // Verify webhook
            const evt = wh.verify(body, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            }) as ClerkWebhookEvent;

            console.log("EVENT TYPE:", evt.type);

            // =========================
            // User Created
            // =========================
            if (evt.type === "user.created") {
                const {
                    id,
                    email_addresses,
                    first_name,
                    last_name,
                } = evt.data;

                const email = email_addresses?.[0]?.email_address;

                if (!email) {
                    throw new Error("Email missing");
                }

                const name =
                    `${first_name || ""} ${last_name || ""}`.trim();

                await ctx.runMutation(api.users.syncUser, {
                    userId: id,
                    email,
                    name,
                });

                console.log("USER SYNCED");
            }

            return new Response("Webhook processed successfully", {
                status: 200,
            });
        } catch (error: any) {
            console.error("FULL WEBHOOK ERROR:", error);

            return new Response(
                JSON.stringify({
                    error: error?.message || "Unknown error",
                }),
                {
                    status: 500,
                }
            );
        }
    }),
});

export default http;