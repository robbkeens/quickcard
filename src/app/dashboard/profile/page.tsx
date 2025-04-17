"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, query, collection, where, getDocs, limit } from "firebase/firestore";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { toast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/image-upload';

const profileSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be less than 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    bookmarkImage: z.string().url("Invalid URL").optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUsername, setCurrentUsername] = useState<string | null>(null);
    const [currentBookmarkImage, setCurrentBookmarkImage] = useState<string | null>(null);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            username: "",
            bookmarkImage: "",
        },
        mode: "onChange",
    });

    useEffect(() => {
        // Redirect if user is not logged in
        if (!authLoading && !user) {
            router.push('/login?redirect=/dashboard/profile');
            return;
        }

        const fetchProfileData = async () => {
            if (user) {
                setIsLoading(true);
                try {
                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        setCurrentUsername(userData.username || null);
                        setCurrentBookmarkImage(userData.bookmarkImage || null);
                        form.reset({
                            username: userData.username || "",
                            bookmarkImage: userData.bookmarkImage || "",
                        });
                    }
                } catch (error) {
                    console.error("Error fetching profile data: ", error);
                    setError("Failed to load profile data.");
                    toast({ title: "Error", description: "Failed to load profile data.", variant: "destructive" });
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchProfileData();
    }, [user, authLoading, router, form]);

    const isUsernameTaken = async (username: string): Promise<boolean> => {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username), where("__name__", "!=", user!.uid), limit(1)); // Exclude current user
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    };

    const handleSaveProfile = async (values: ProfileFormValues) => {
        setIsLoading(true);
        setError(null);

        try {
            if (values.username !== currentUsername) { // Only check if username is being changed
                const usernameExists = await isUsernameTaken(values.username);
                if (usernameExists) {
                    setError("This username is already taken.");
                    toast({ title: "Error", description: "This username is already taken.", variant: "destructive" });
                    return;
                }
            }

            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                username: values.username,
                bookmarkImage: values.bookmarkImage,
            });

            setCurrentUsername(values.username);
            setCurrentBookmarkImage(values.bookmarkImage);
            toast({ title: "Success!", description: "Profile updated successfully." });
            //router.push('/dashboard'); // Redirect to dashboard or stay here?
        } catch (error: any) {
            console.error("Error updating profile: ", error);
            setError("Failed to update profile. Please try again.");
            toast({ title: "Error", description: "Failed to update profile. Please try again.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading authentication...</div>;
    }

    if (!user) {
        return null; // Already redirected
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">User Profile</h1>

            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Update Profile</CardTitle>
                    <CardDescription>Manage your profile settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSaveProfile)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="your_unique_username" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Your username will be used in your card URL (e.g., quickcard.co.ke/<strong>your_username</strong>/card-name).
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="bookmarkImage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bookmark Image URL</FormLabel>
                                        <FormControl>
                                             <ImageUpload
                                                fieldName="bookmarkImage"
                                                value={field.value}
                                                onChange={field.onChange}
                                                folderPath="user-images/bookmark"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Upload bookmark image.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <Button type="submit" disabled={isLoading || !form.formState.isValid}>
                                {isLoading ? "Saving..." : "Save Profile"}
                            </Button>
                        </form>
                    </Form>
                    {currentUsername && (
                        <p className="mt-4 text-sm text-gray-500">
                            Current username: <strong>{currentUsername}</strong>
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}