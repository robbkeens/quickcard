"use client";

import React from 'react';
import Image from 'next/image'

interface AvatarSuggestionProps {
    imageUrl: string;
    onSelect: (imageUrl: string) => void;
}

const AvatarSuggestion: React.FC<AvatarSuggestionProps> = ({ imageUrl, onSelect }) => {
    return (
        <button onClick={() => onSelect(imageUrl)} className="rounded-full overflow-hidden w-16 h-16 border border-gray-300 hover:border-blue-500 transition-colors cursor-pointer">
             <Image
                src={imageUrl}
                alt="Avatar Suggestion"
                width={64}
                height={64}
                className="object-cover w-full h-full"
            />
        </button>
    );
};

export default AvatarSuggestion;