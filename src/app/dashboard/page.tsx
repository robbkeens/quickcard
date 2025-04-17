"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not loading and no user is found
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    // Redirect to login page after logout
    router.push('/login');
  };

  // Don't render anything while loading or if there's no user (redirection is happening)
  if (loading || !user) {
    // You could show a loading spinner here if desired
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Welcome to your Dashboard</CardTitle>
          <CardDescription>Manage your Quick Cards and view analytics.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>You are logged in as: <strong>{user.email}</strong></p>
          
          {/* Placeholder for future content */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">My Cards</h3>
            <p className="text-sm text-gray-500 mb-3">Your created business cards will appear here.</p>
            <Link href="/dashboard/cards/new"> {/* Link to create a new card */}
              <Button>Create New Card</Button>
            </Link>
            {/* TODO: List existing cards */}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-sm text-gray-500">Card performance metrics will be displayed here.</p>
             {/* TODO: Display analytics */}
          </div>

        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
           <Button variant="destructive" onClick={handleLogout}>
             Logout
           </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
