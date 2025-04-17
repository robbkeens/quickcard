import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { disableCard, enableCard } from '@/lib/helpers';
import { buffer } from 'node:stream/consumers';

let serviceAccount = null;

try {
    serviceAccount = require("../../serviceAccountKey.json");
} catch (error) {
    console.error("Failed to load service account key:", error);
}

// Initialize Firebase Admin SDK
if (serviceAccount) {
  try {
    if (getApps().length===0) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    let event: Stripe.Event;
     try {
      const buf = await buffer(req);
      const sig = req.headers['stripe-signature'] as string;
      if (!sig) {
        return res.status(400).send(`Webhook Error: No stripe signature`);
      }
      event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);

    } catch (error :any) {
         console.log(`Error buffer`, error.message);
         return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout Session was completed!');

        const userId = session.metadata?.firebaseUid || undefined;
        const cardId = session.metadata?.cardId || undefined;


          if (userId && cardId) {
              await enableCard(userId, cardId);
          } else {
              console.error("No userId or cardId found in completed checkout session!");
          }
        break;
      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Payment was succeded");

        const userIdenable = invoice.metadata?.firebaseUid  || undefined;
        const cardIdenable = invoice.metadata?.cardId  || undefined;

        if (userIdenable && cardIdenable) {
            await enableCard(userIdenable, cardIdenable);
        } else {
            console.error("No userId found in invoice succeded!");
        }

        break;
      case 'invoice.payment_failed':
        const invoicefail = event.data.object as Stripe.Invoice;
        console.log("Payment was failed");

        const userIdDisable = invoicefail.metadata?.firebaseUid  || undefined;
        const cardIdDisable = invoicefail.metadata?.cardId  || undefined;

        if (userIdDisable && cardIdDisable) {
            await disableCard(userIdDisable, cardIdDisable);
        } else {
            console.error("No userId or cardId found in payment failed!");
        }
        break;
       case 'customer.subscription.deleted':
        const subscriptiondeleted = event.data.object as Stripe.Subscription;
        console.log("Subscription was deleted");

        const userIddeleted = subscriptiondeleted.metadata?.firebaseUid  || undefined;
        const cardIddeleted = subscriptiondeleted.metadata?.cardId  || undefined;

        if (userIddeleted && cardIddeleted) {
            await disableCard(userIddeleted, cardIddeleted);
        } else {
            console.error("No userId or cardId found in deleted subscrition!");
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return res.status(200).end();
  }
   return res.status(405).send(\`Method Not Allowed\`);
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;