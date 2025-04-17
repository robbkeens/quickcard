import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import Stripe from 'stripe';


export const disableCard = async (userId: string, cardId: string) => {
    try {
        const db = getFirestore();
        const cardRef = db.collection("users").doc(userId).collection("cards").doc(cardId);

        await cardRef.update({
            isActive: false,
        });

        console.log(`Successfully disabled card ${cardId} for user ${userId}`);
    } catch (error) {
        console.error("Error disabling card: ", error);
    }
};

export const enableCard = async (userId: string, cardId: string) => {
    try {
        const db = getFirestore();
        const cardRef = db.collection("users").doc(userId).collection("cards").doc(cardId);

        await cardRef.update({
            isActive: true,
        });

        console.log(`Successfully enabled card ${cardId} for user ${userId}`);
    } catch (error) {
        console.error("Error enabling card: ", error);
    }
};