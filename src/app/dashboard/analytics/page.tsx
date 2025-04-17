"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
    views: number;
    clicks: { [key: string]: number } | null;
}

interface CardData {
    id: string;
    name: string;
    analytics: AnalyticsData | null;
}

export default function AnalyticsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [cards, setCards] = useState<CardData[]>([]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/dashboard/analytics');
            return;
        }

        const fetchCards = async () => {
            setIsLoading(true);
            try {
                const cardsCollectionRef = collection(db, "users", user!.uid, "cards");
                const cardsQuery = query(cardsCollectionRef);
                const cardsSnapshot = await getDocs(cardsQuery);

                const cardData: CardData[] = await Promise.all(
                    cardsSnapshot.docs.map(async (cardDoc) => {
                        const data = cardDoc.data();
                        return {
                            id: cardDoc.id,
                            name: data.businessName || data.firstName + ' ' + data.lastName,
                            analytics: {
                                views: data.views || 0,
                                clicks: data.clicks || {},
                            },
                        };
                    })
                );

                setCards(cardData);
            } catch (error) {
                console.error("Error fetching cards: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchCards();
        }
    }, [user, authLoading, router]);

    if (authLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading authentication...</div>;
    }

    if (!user) {
        return null; // Already redirected
    }

    const getClickData = (card: CardData) => {
        const clicks = card.analytics?.clicks || {};
        return Object.entries(clicks).map(([name, value]) => ({
            name,
            value,
        }));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <CardTitle><Skeleton className="h-6 w-full" /></CardTitle>
                                <CardDescription><Skeleton className="h-4 w-[90%]" /></CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-32 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cards.map((card) => (
                        <Card key={card.id}>
                            <CardHeader>
                                <CardTitle>{card.name || 'Unnamed Card'}</CardTitle>
                                <CardDescription>Card ID: {card.id}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4">
                                    <p className="text-sm font-medium">Total Views: {card.analytics?.views || 0}</p>
                                </div>
                                {/* Click Analytics Chart */}
                                {card.analytics?.clicks && Object.keys(card.analytics.clicks).length > 0 ? (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={getClickData(card)}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-sm text-gray-500">No click data available for this card.</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}