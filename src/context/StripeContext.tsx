"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Stripe, loadStripe } from '@stripe/stripe-js';

interface StripeContextProps {
    stripe: Stripe | null;
}

const StripeContext = createContext<StripeContextProps | undefined>(undefined);

interface StripeProviderProps {
    children: React.ReactNode;
    stripePublicKey: string;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children, stripePublicKey }) => {
    const [stripe, setStripe] = useState<Stripe | null>(null);

    useEffect(() => {
        const initializeStripe = async () => {
            try {
                const stripeInstance = await loadStripe(stripePublicKey);
                if (stripeInstance) {
                    setStripe(stripeInstance);
                } else {
                    console.error("Failed to load Stripe.");
                }
            } catch (error) {
                console.error("Error loading Stripe: ", error);
            }
        };

        initializeStripe();
    }, [stripePublicKey]);

    return (
        <StripeContext.Provider value={{ stripe }}>
            {children}
        </StripeContext.Provider>
    );
};

export const useStripe = (): StripeContextProps => {
    const context = useContext(StripeContext);
    if (!context) {
        throw new Error("useStripe must be used within a StripeProvider");
    }
    return context;
};
