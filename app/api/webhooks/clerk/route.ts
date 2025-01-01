import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createOrUpdateUser } from "@/utils/db/actions";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SINGING_SECRET from clerk dashboard to .env or .env.local"
    );
  }

  // create svix secrete instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // if there are no header , throw error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", { status: 400 });
  }

  // get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (error) {
    console.error('Error: Could not verify webhook:', error)
    return new Response('Error: Verification error', {
      status: 400,
    })

  }

  // store the data to database

const {id} = evt.data
const eventType = evt.type


if(eventType ==='user.created' || eventType ==='user.updated'){
    const {id,email_addresses, first_name, last_name} = evt.data
    const email = email_addresses[0]?.email_address
    const name = `${first_name} ${last_name}`
    
    if(email){
        try {
            await createOrUpdateUser (id,email,name)
            console.log(`user ${id} create/update successfully`)
        } catch (error) {
            console.error('Error creating or updating user',error)
            return new Response('Error processing user data',{status:500})
        }
    }
}

console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
// console.log('Webhook payload:', body)


return  new Response('Webhook received',{status:200})

}

