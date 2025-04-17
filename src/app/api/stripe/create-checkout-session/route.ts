import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert } from 'firebase-admin/app';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

// Initialize Firebase Admin SDK
const serviceAccount = require('../../serviceAccountKey.json');

if (!initializeApp.apps.length) {
    initializeApp({
        credential: cert(serviceAccount),
    });
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const { priceId, cardId, firebaseUid } = req.body;

        try {
            // Verify Firebase UID
            try {
                await getAuth().getUser(firebaseUid);
            } catch (error: any) {
                console.error("Error verifying Firebase UID: ", error);
                return res.status(400).json({ error: 'Invalid Firebase UID' });
            }
            const db = getFirestore()
            const cardRef = db.collection("users").doc(firebaseUid).collection("cards").doc(cardId);
            const cardSnap = await cardRef.get()
            if (!cardSnap.exists) {
                console.error("Card doesnt exists");
                return res.status(400).json({ error: 'Card doesnt exists' });
            }
            // Create Checkout Sessions from body params.
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: `${req.headers.origin}/dashboard/?success=true`,
                cancel_url: `${req.headers.origin}/pricing/?canceled=true`,
                metadata: {
                    firebaseUid: firebaseUid,
                    cardId: cardId,
                },
            });
            res.status(200).json({ sessionId: session.id });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
};

export default handler;