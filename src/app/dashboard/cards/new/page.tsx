"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CardForm } from '@/components/card-form';
import { CardFormData, defaultCardFormValues } from '@/lib/validators/cardFormSchema';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, limit, addDoc } from "firebase/firestore";
import { toast } from '@/hooks/use-toast';
import BusinessCard from '@/components/business-card';
import { generate } from '@/lib/utils';

interface NewCardPageProps {}

export default function NewCardPage({}: NewCardPageProps) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<CardFormData>(defaultCardFormValues);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        // Redirect if user is not logged in
        if (!authLoading && !user) {
            router.push('/login?redirect=/dashboard/cards/new');
            return;
        }

        const fetchUsername = async () => {
            if (user) {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    setUsername(userData.username || null);
                }
            }
        };

        fetchUsername();
    }, [user, authLoading, router]);

    const isSlugTaken = async (slug: string, userId: string): Promise<boolean> => {
        const cardsRef = collection(db, "users", userId, "cards");
        const q = query(cardsRef, where("cardSlug", "==", slug), limit(1));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    };

    const handleCreateCard = async (data: CardFormData) => {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in to create a card.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (!username) {
                setError("Please create a username in your profile settings before creating a card.");
                toast({ title: "Error", description: "Please create a username in your profile settings before creating a card.", variant: "destructive" });
                return;
            }

            let cardSlug = data.cardSlug;

             // Auto-generate slug if not provided
            if (!cardSlug) {
                cardSlug = generate();
                data.cardSlug = cardSlug;
            }

            const slugExists = await isSlugTaken(cardSlug, user.uid);
            if (slugExists) {
                setError(`The slug '${cardSlug}' is already taken. Please choose another.`);
                setIsLoading(false);
                toast({ title: "Validation Error", description: `The slug '${cardSlug}' is already taken. Please choose another.`, variant: "destructive" });
                return;
            }

            const cardsCollectionRef = collection(db, "users", user.uid, "cards");

            const initialCardData = {
                ...data,
                userId: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isActive: true, // Enable card by default
                views: 0,
                 clicks: {
                    call: 0,
                    whatsapp: 0,
                    email: 0,
                    website: 0,
                    booking: 0,
                    location: 0,
                    store_name: 0,
                    linkedin: 0,
                    facebook: 0,
                    twitter: 0,
                    github: 0,
                    instagram: 0,
                    youtube: 0,
                     tiktok: 0,
                    threads: 0,
                    behance: 0,
                    dribbble: 0,
                    cashapp: 0,
                    paypal:0
                }
            };

            const docRef = await addDoc(cardsCollectionRef, initialCardData);

            toast({ title: "Success!", description: "Your card has been created." });
            router.push(`/dashboard/cards/${docRef.id}/edit`);

        } catch (error: any) {
            console.error("Error creating card: ", error);
            setError("Failed to create card. Please try again.");
            toast({ title: "Error", description: "Failed to create card. Please try again.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const updatePreview = useCallback((data: CardFormData) => {
        setPreviewData(data);
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Create New Business Card</h1>

            {username === null ? (
                <p>Please set a username in your <a href="/dashboard/profile">profile settings</a> to create a card.</p>
            ) : (
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/2">
                        <CardForm
                            onSubmit={handleCreateCard}
                            isLoading={isLoading}
                            submitButtonText="Create Card"
                            onChange={updatePreview}
                        />
                        {error && <p className="mt-4 text-red-600">Error: {error}</p>}
                    </div>
                    <div className="md:w-1/2">
                        <h2 className="text-xl font-semibold mb-2">Live Preview</h2>
                        <div className="border rounded-md p-4">
                            <BusinessCard {...previewData} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}