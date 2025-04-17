"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase"; // Your Firebase storage instance
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Image from 'next/image';
import { UploadCloud, X as CloseIcon, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { defaultAvatars } from '@/lib/avatars';

interface ImageUploadProps {
    fieldName: string; // Unique identifier for the upload instance (e.g., 'headshot', 'cover')
    value: string | null | undefined; // Current image URL
    onChange: (url: string | null) => void; // Function to call when URL changes (upload or removal)
    folderPath?: string; // Optional subfolder in Firebase Storage (e.g., 'card-images')
    disabled?: boolean;
    showSuggestions?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ fieldName, value, onChange, folderPath = 'uploads', disabled, showSuggestions = false }) => {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

    useEffect(() => {
        // Sync internal state with prop value
        setCurrentImageUrl(value ?? null);
    }, [value]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!user || disabled) return;
        const file = acceptedFiles[0];
        if (!file) return;

        // Basic validation (optional)
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
            setError('Invalid file type. Please upload JPG, PNG, or GIF.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
             setError('File size exceeds 5MB limit.');
             return;
        }

        setError(null);
        setUploading(true);
        setProgress(0);

        // Construct storage path
        const storagePath = `${folderPath}/${user.uid}/${fieldName}_${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);

        // --- If there's an existing image, delete it first --- 
        // Note: This assumes the 'value' prop holds the full URL, which might not 
        // contain the storage path. A better approach might be to store the path 
        // alongside the URL, or extract the path from the URL if possible.
        // For simplicity now, we'll upload the new one. Consider adding deletion logic.
        // if (currentImageUrl) {
        //     try {
        //         const oldRef = ref(storage, currentImageUrl); // This needs the PATH, not URL
        //         await deleteObject(oldRef);
        //     } catch (delError: any) {
        //         // Ignore deletion errors if file doesn't exist (e.g., manual deletion)
        //         if (delError.code !== 'storage/object-not-found') {
        //             console.warn("Could not delete previous image:", delError);
        //         }
        //     }
        // }

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(progress);
            },
            (error) => {
                console.error("Upload Error:", error);
                setError(`Upload failed: ${error.message}`);
                setUploading(false);
                setProgress(0);
            },
            async () => {
                // Upload completed successfully, now get the download URL
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setCurrentImageUrl(downloadURL);
                    onChange(downloadURL); // Update form state
                } catch (urlError) {
                    console.error("Error getting download URL:", urlError);
                    setError("Upload succeeded, but failed to get image URL.");
                } finally {
                    setUploading(false);
                    setProgress(0);
                }
            }
        );
    }, [user, fieldName, folderPath, onChange, disabled]); // Removed currentImageUrl from deps to avoid issues with deletion logic placeholder

    const handleRemoveImage = async () => {
        if (!currentImageUrl || !user || disabled) return;

        // Optional: Delete from Firebase Storage
        // This requires the storage PATH, not the URL. If you only store the URL,
        // deletion from the client might be tricky/insecure without backend help
        // or storing the path separately.
        // try {
        //    // Example: Extract path (HIGHLY dependent on URL structure)
        //    const imagePath = decodeURIComponent(currentImageUrl.split('/o/')[1].split('?')[0]);
        //    if (imagePath) {
        //        const imageRef = ref(storage, imagePath);
        //        await deleteObject(imageRef);
        //    }
        // } catch (error: any) { 
        //     console.error("Error deleting image from storage: ", error);
        //     // Decide if you want to proceed with UI removal even if storage deletion fails
        //     // setError("Failed to remove image from storage."); 
        //     // return; 
        // }

        setCurrentImageUrl(null);
        onChange(null); // Update form state to remove the URL
        setError(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/jpeg': [], 'image/png': [], 'image/gif': [] }, multiple: false, disabled });

    return (
        <div className="space-y-2">
            {currentImageUrl ? (
                <div className="relative group w-full h-48 border rounded-md overflow-hidden">
                    <Image
                        src={currentImageUrl}
                        alt={`${fieldName} preview`}
                        layout="fill"
                        objectFit="contain" // Use 'cover' or 'contain' based on preference
                    />
                     {!disabled && (
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            onClick={handleRemoveImage}
                            aria-label="Remove Image"
                        >
                            <CloseIcon className="h-4 w-4" />
                        </Button>
                     )}
                </div>
            ) : (
                <>
                    <div
                        {...getRootProps()}
                        className={cn(
                            "border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors",
                            isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "bg-gray-50 dark:bg-gray-800/30",
                            disabled ? "cursor-not-allowed opacity-60" : ""
                        )}
                    >
                        <input {...getInputProps()} disabled={disabled} />
                        <div className="flex flex-col items-center justify-center space-y-2 text-gray-500 dark:text-gray-400">
                            <UploadCloud className="h-8 w-8" />
                            {isDragActive ? (
                                <p>Drop the image here ...</p>
                            ) : (
                                <p>Drag & drop an image here, or click to select</p>
                            )}
                            <p className="text-xs">JPG, PNG, GIF up to 5MB</p>
                        </div>
                    </div>
                    {showSuggestions && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {defaultAvatars.map((avatar) => (
                                <Image
                                    key={avatar}
                                    src={avatar}
                                    alt="Default Avatar"
                                    width={50}
                                    height={50}
                                    className="rounded-full cursor-pointer hover:opacity-75 transition-opacity"
                                    onClick={() => onChange(avatar)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {uploading && (
                <Progress value={progress} className="w-full h-2 mt-2" />
            )}
            {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
};
