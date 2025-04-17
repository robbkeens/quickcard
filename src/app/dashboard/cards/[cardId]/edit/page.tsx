"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CardForm } from '@/components/card-form';
import { CardFormData, defaultCardFormValues } from '@/lib/validators/cardFormSchema';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, limit } from "firebase/firestore";
import { toast } from '@/hooks/use-toast';
import BusinessCard from '@/components/business-card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cardFormSchema } from '@/lib/validators/cardFormSchema';
import { generate } from '@/lib/utils';

interface EditCardPageProps {}

export default function EditCardPage({}: EditCardPageProps) {
    const { cardId } = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [initialData, setInitialData] = useState<Partial<CardFormData> | null>(null);
    const [username, setUsername] = useState<string | null>(null);

    const methods = useForm<CardFormData>({
        resolver: zodResolver(cardFormSchema),
        mode: 'onChange',
    });

    useEffect(() => {
        // Redirect if user is not logged in
        if (!authLoading && !user) {
            router.push(`/login?redirect=/dashboard/cards/${cardId}/edit`);
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

        // Fetch card data when cardId and user are available
        if (cardId && user) {
            fetchCardData(cardId as string, user.uid);
            fetchUsername();
        }
    }, [cardId, user, authLoading, router]);

    const fetchCardData = async (cardId: string, userId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const cardRef = doc(db, "users", userId, "cards", cardId);
            const cardSnap = await getDoc(cardRef);

            if (cardSnap.exists()) {
                const data = cardSnap.data() as CardFormData;
                 // Ensure slug is provided and unique for the user
                if (!data.cardSlug) {
                    data.cardSlug = generate();
                    await updateDoc(cardRef, {cardSlug: data.cardSlug});
                }
                setInitialData(data);
                methods.reset(data);
            } else {
                setError("Card not found.");
                toast({ title: "Error", description: "Card not found.", variant: "destructive" });
                router.push('/dashboard');
            }
        } catch (error: any) {
            console.error("Error fetching card data: ", error);
            setError("Failed to load card data.");
            toast({ title: "Error", description: "Failed to load card data.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCard = async (data: CardFormData) => {
        if (!user || !cardId) {
            toast({ title: "Error", description: "Not authorized or missing card ID.", variant: "destructive" });
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
            const cardRef = doc(db, "users", user.uid, "cards", cardId as string);
            await updateDoc(cardRef, {
                ...data,
                updatedAt: serverTimestamp()
            });

            toast({ title: "Success!", description: "Card updated successfully." });
            router.push('/dashboard');
        } catch (error: any) {
            console.error("Error updating card: ", error);
            setError("Failed to update card.");
            toast({ title: "Error", description: "Failed to update card.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

     const updatePreview = useCallback((data: CardFormData) => {
      // This function is not used in this version of the component
      // but keeping it for potential future use
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Edit Business Card</h1>
             {username === null ? (
                <p>Please set a username in your <a href="/dashboard/profile">profile settings</a> to create a card.</p>
            ) : (
            <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/2">
                    {/* Render the Card Form component with initial data */}
                    <CardForm
                        onSubmit={handleUpdateCard}
                        initialData={initialData}
                        isLoading={isLoading}
                        onChange={updatePreview}
                    />
                    {error && (
                        <p className="mt-4 text-red-600">Error: {error}</p>
                    )}
                </div>
                <div className="md:w-1/2">
                    {/* Live Preview */}
                    <h2 className="text-xl font-semibold mb-2">Live Preview</h2>
                    <div className="border rounded-md p-4">
                        {methods.watch() ? (
                            <BusinessCard {...methods.watch()} />
                        ) : (
                            <p className="text-gray-500">Loading preview...</p>
                        )}
                    </div>
                </div>
            </div>
             )}
        </div>
    );
}