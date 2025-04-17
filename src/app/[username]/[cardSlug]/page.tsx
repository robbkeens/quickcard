"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, updateDoc, doc, increment } from "firebase/firestore";
import BusinessCard, { BusinessCardProps } from '@/components/business-card';
import { notFound } from 'next/navigation';

export default function PublicCardPage() {
    const { username, cardSlug } = useParams();
    const [cardData, setCardData] = useState<BusinessCardProps | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (username && cardSlug) {
            fetchCardData(username as string, cardSlug as string);
        }
    }, [username, cardSlug]);

    const fetchCardData = async (username: string, cardSlug: string) => {
        setLoading(true);
        try {
            // 1. Get the user ID based on the username
            const usersRef = collection(db, "users");
            const userQuery = query(usersRef, where("username", "==", username), limit(1));
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
                notFound(); // User not found, show 404
                return;
            }

            const userId = userSnapshot.docs[0].id; // Assuming username is unique

            // 2. Query the cards subcollection for the given slug
            const cardsRef = collection(db, "users", userId, "cards");
            const cardQuery = query(cardsRef, where("cardSlug", "==", cardSlug), limit(1));
            const cardSnapshot = await getDocs(cardQuery);

            if (cardSnapshot.empty) {
                notFound(); // Card not found, show 404
                return;
            }

            const cardDoc = cardSnapshot.docs[0];
            const data = cardDoc.data();

            if (!data.isActive) {
                return <div>This card is currently inactive.</div>; // Or redirect to a "card inactive" page
            }

            setCardData(data as BusinessCardProps);

            // Increment the view count (optional - consider throttling/debouncing)
            const cardRef = doc(db, "users", userId, "cards", cardDoc.id);
            await updateDoc(cardRef, { views: increment(1) });

        } catch (error) {
            console.error("Error fetching card data: ", error);
            notFound(); // Or display an error message
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading card...</div>;
    }

    if (!cardData) {
        return <div>Card not found.</div>; // Should be handled by notFound() but keep for safety
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <BusinessCard {...cardData} />
        </div>
    );
}
