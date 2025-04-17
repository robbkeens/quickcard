"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface AvatarSuggestionsProps {
    onSelect: (imageUrl: string) => void;
}

const AvatarSuggestions: React.FC<AvatarSuggestionsProps> = ({ onSelect }) => {
    // Array of paths to your default avatar images in the public/avatars directory
    const avatarOptions = [
        '/avatars/avatar-1.png',
        '/avatars/avatar-2.png',
        '/avatars/avatar-3.png',
        // Add more avatar image paths here
    ];

    return (
        <div className="flex flex-wrap gap-2">
            {avatarOptions.map((avatar, index) => (
                <Button
                    key={index}
                    variant="outline"
                    size="icon"
                    onClick={() => onSelect(avatar)}
                    className="h-16 w-16 p-0 border-2 hover:border-blue-500 transition-colors"
                >
                    <Image
                        src={avatar}
                        alt={`Avatar Suggestion ${index + 1}`}
                        width={64}
                        height={64}
                        className="object-cover rounded-full"
                    />
                </Button>
            ))}
        </div>
    );
};

export default AvatarSuggestions;