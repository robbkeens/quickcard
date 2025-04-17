"use client";

import React from 'react';
import { plans } from '@/lib/plans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useStripe } from '@/context/StripeContext';

const PricingPage = () => {
    const { stripe } = useStripe();

    const handleStripeSubscribe = async (priceId: string) => {
        if (!stripe) {
            console.error("Stripe SDK not loaded!");
            return;
        }

        try {
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ priceId }),
            });

            const data = await response.json();

            if (response.ok && data.sessionId) {
                stripe.redirectToCheckout({ sessionId: data.sessionId });
            } else {
                console.error("Error creating checkout session:", data.error);
                alert("Failed to redirect to checkout. Please try again.");
            }
        } catch (error) {
            console.error("Error creating checkout session:", error);
            alert("Failed to redirect to checkout. Please try again.");
        }
    };

    const handlePayPalSubscribe = async (planName: string) => {
        try {
            const response = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ planName }),
            });

            const data = await response.json();

            if (response.ok && data.orderId) {
                // Redirect to PayPal approval URL or handle approval in a modal
                window.location.href = data.approvalUrl;
            } else {
                console.error("Error creating PayPal order:", data.error);
                alert("Failed to create PayPal order. Please try again.");
            }
        } catch (error) {
            console.error("Error creating PayPal order:", error);
            alert("Failed to create PayPal order. Please try again.");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Pricing Plans</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                    <Card key={plan.name}>
                        <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>Pay {plan.price} every {plan.duration}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ul>
                                {plan.features.map((feature) => (
                                    <li key={feature}>{feature}</li>
                                ))}
                            </ul>
                            <Button onClick={() => handleStripeSubscribe(plan.stripePriceId)}>Subscribe with Stripe</Button>
                            <Button variant="secondary" onClick={() => handlePayPalSubscribe(plan.name)}>Subscribe with PayPal</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default PricingPage;