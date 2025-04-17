
import { z } from "zod";

// --- Enum Definitions for Specific Fields ---
const PrimaryActionTypeEnum = z.enum(['call', 'whatsapp', 'email', 'website', 'booking', 'location', 'store_name']);
const SocialPlatformEnum = z.enum(['linkedin', 'facebook', 'twitter', 'github', 'instagram', 'youtube', 'tiktok', 'threads', 'behance', 'dribbble', 'cashapp', 'paypal']);
const FeaturedContentTypeEnum = z.enum(['media', 'product', 'cta', 'video', 'link']);
const ButtonStyleEnum = z.enum(['solid', 'outline', 'gradient']).optional();

// --- Sub-Schemas ---
const ActionButtonSchema = z.object({
    type: PrimaryActionTypeEnum,
    label: z.string().min(1, "Action label cannot be empty"),
    value: z.string().min(1, "Action value cannot be empty"), // Add more specific validation (URL, phone, email) if needed
});

const SocialLinkSchema = z.object({
    platform: SocialPlatformEnum,
    url: z.string().url("Please enter a valid URL (e.g., https://...)"),
});

const FeaturedContentItemSchema = z.object({
    type: FeaturedContentTypeEnum,
    title: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().url("Please enter a valid image URL").optional().or(z.literal('')),
    linkUrl: z.string().url("Please enter a valid link URL").optional().or(z.literal('')),
    buttonText: z.string().optional(),
    videoUrl: z.string().url("Please enter a valid video URL").optional().or(z.literal('')),
});

// --- Main Card Form Schema ---
export const cardFormSchema = z.object({
    // --- Visuals ---
    headerImageUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
    coverImageUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
    brandImageUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
    headshotImageUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
    // headshotSuggestionUrl: z.string().optional(), // Likely not user-editable

    // --- Personal & Business Info ---
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    jobTitle: z.string().optional(),
    businessName: z.string().optional(),
    businessAddress: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(), // Could use an enum if you have a predefined list
    businessDescription: z.string().max(500, "Description cannot exceed 500 characters").optional(),

    // --- Actions ---
    // Use refine to limit the number of primary actions
    primaryActions: z.array(ActionButtonSchema)
        .max(2, "You can select a maximum of 2 primary actions")
        .optional()
        .default([]),
    secondaryActions: z.array(SocialLinkSchema).optional().default([]),

    // --- Featured Content ---
    featuredContent: z.array(FeaturedContentItemSchema).optional().default([]),

    // --- Customization ---
    headerBackgroundColor: z.string().optional(), // Consider regex for hex color validation: .regex(/^#([0-9a-f]{3}){1,2}$/i, "Invalid hex color")
    bodyBackgroundColor: z.string().optional(),
    buttonBackgroundColor: z.string().optional(),
    buttonStyle: ButtonStyleEnum,
    featuredContentBackgroundColor: z.string().optional(),
    textColor: z.string().optional(),

    // --- Footer ---
    customFooterText: z.string().optional(),
    customFooterLink: z.string().url("Invalid URL").optional().or(z.literal('')),
    showDefaultFooter: z.boolean().default(true),

    // --- Meta (Consider if these are user-editable) ---
    // favicon: z.string().url().optional(),
    // bookmarkImage: z.string().url().optional(),
    cardSlug: z.string().min(3, "Card URL slug must be at least 3 characters")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
        .optional(), // Should be required, potentially generated?
});

// --- Type Inference ---
export type CardFormData = z.infer<typeof cardFormSchema>;

// --- Default Values ---
// Useful for initializing the form
export const defaultCardFormValues: Partial<CardFormData> = {
    firstName: "",
    lastName: "",
    jobTitle: "",
    businessName: "",
    businessDescription: "",
    headerImageUrl: "",
    coverImageUrl: "",
    brandImageUrl: "",
    headshotImageUrl: "",
    businessAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    primaryActions: [],
    secondaryActions: [],
    featuredContent: [],
    headerBackgroundColor: "#FFFFFF", // Example default
    bodyBackgroundColor: "#FFFFFF",
    buttonBackgroundColor: "#000000", // Example default
    buttonStyle: "solid",
    featuredContentBackgroundColor: "#F9FAFB", // Example default
    textColor: "#111827", // Example default
    customFooterText: "",
    customFooterLink: "",
    showDefaultFooter: true,
    cardSlug: "",
};
