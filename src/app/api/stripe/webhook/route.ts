import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'node:stream/consumers';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { disableCard, enableCard } from '@/lib/helpers';

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

if (!initializeApp.apps.length) {
    initializeApp({
        credential: cert(serviceAccount),
    });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const buf = await buffer(req);
        const sig = req.headers['stripe-signature'] as string;

        let event;

        try {
            event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
        } catch (err: any) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                // Fulfill the purchase...
                console.log('Checkout Session was completed!');
                // Extract relevant information from the session
                const customerId = session.customer as string;
                const subscriptionId = session.subscription as string;
                //const priceId = session.line_items?.data[0].price.id

                // Get subscription details
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);

                // Get line items

                //const priceId = subscription.items.data[0].price.id

                const userId = subscription.metadata.firebaseUid;
                const cardId = subscription.metadata.cardId;

                if (userId && cardId) {
                    await enableCard(userId, cardId);
                } else {
                    console.error("No userId found in completed checkout session!");
                }

                break;
            case 'invoice.payment_succeeded':
                const invoice = event.data.object as Stripe.Invoice;
                console.log("Payment was succeded");
                const userIdenable = invoice.metadata.firebaseUid;
                const cardIdenable = invoice.metadata.cardId;
                if (userIdenable && cardIdenable) {
                    await enableCard(userIdenable, cardIdenable);
                } else {
                    console.error("No userId found in invoice succeded!");
                }

                break;

            case 'invoice.payment_failed':
                const invoicefail = event.data.object as Stripe.Invoice;
                console.log("Payment was failed");

                const userIdDisable = invoicefail.metadata.firebaseUid;
                const cardIdDisable = invoicefail.metadata.cardId;

                if (userIdDisable && cardIdDisable) {
                    await disableCard(userIdDisable, cardIdDisable);
                } else {
                    console.error("No userId found in payment failed!");
                }
                break;

            case 'customer.subscription.deleted':
                const subscriptiondeleted = event.data.object as Stripe.Subscription;
                console.log("Subscription was deleted");

                const userIddeleted = subscriptiondeleted.metadata.firebaseUid;
                const cardIddeleted = subscriptiondeleted.metadata.cardId;

                if (userIddeleted && cardIddeleted) {
                    await disableCard(userIddeleted, cardIddeleted);
                } else {
                    console.error("No userId found in deleted subscrition!");
                }
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.status(200).end();
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
};

export const config = {
    api: {
        bodyParser: false,
    },
};

export default handler;