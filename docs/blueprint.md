# Quick Card Application Blueprint

This document outlines the features, components, and architecture for the Quick Card digital business card application.

## I. Core Requirements

*   **Platform:** Web Application (Next.js/React)
*   **Branding:** Use `https://quickcard.co.ke/` for design cues (colors, fonts, style). Company name is "Quick Card".
*   **Responsiveness:** Mobile-first design.
*   **Hosting:** Cards hosted on a short URL (e.g., `quickcard.co.ke/[username]/[card_slug]`).

## II. Card Structure & Content

*   **Layout:** Design a flexible card layout accommodating all elements. Consider multiple creative template options.
*   **Header Image:**
    *   Optional.
    *   Recommended Dimensions: TBD (e.g., 600x200px).
*   **Cover/Brand Image:**
    *   User chooses one or the other.
    *   Cover Image Dimensions: TBD (e.g., 1080x300px).
    *   Brand Logo Dimensions: TBD (e.g., 300x300px).
*   **Headshot:**
    *   Upload: JPEG, PNG, GIF.
    *   Suggestions: Offer a gallery of cool/professional default avatars (GIFs/PNGs) or integrate an avatar generation service.
*   **Personal Information:**
    *   First Name (Required)
    *   Last Name (Required)
    *   Job Title
*   **Business Information:**
    *   Business Name
    *   Business Address
    *   City
    *   State
    *   Postal Code
    *   Country (Dropdown list)
*   **Business Description:** Max 500 characters.
*   **.vcf File:** Auto-generate a vCard (.vcf) file containing contact details for easy saving to phone contacts. Add a "Save Contact" button.
*   **Save Card Shortcut:** Functionality to add a shortcut to the card on the user's phone home screen (using manifest.json for PWA-like behavior and the bookmark image).

## III. Actions

*   **Primary Actions (User selects up to 2):**
    *   Call (Mobile Number - `tel:` link)
    *   Call (Office Number - `tel:` link)
    *   WhatsApp (Direct message link - `https://wa.me/`)
    *   Email (`mailto:` link)
    *   Website (URL link)
    *   Booking Calendar (URL link - e.g., Calendly)
    *   Store Location (URL link - e.g., Google Maps)
    *   Store Name (Display text)
*   **Secondary Actions (Social Media Links):**
    *   LinkedIn
    *   Facebook
    *   Instagram
    *   Twitter (X)
    *   GitHub
    *   Behance
    *   TikTok
    *   Threads
    *   Dribbble
    *   Cash App
    *   PayPal
    *   YouTube

## IV. Featured Content Section (Optional)

*   Attach Media (Images, PDFs)
*   Product Showcase:
    *   Product Image
    *   Product Title/Details
    *   Product Link
*   Custom Call-to-Action (CTA): Button with customizable text and link.
*   Video Embedding: YouTube links (display embedded player).
*   General Links section.

## V. Customization

*   **Colors:**
    *   Header Background
    *   Body Background
    *   Button Background & Styles (Solid, Outline, Gradient options)
    *   Featured Content Section Background
    *   Font Color options
*   **Footer:**
    *   Option to customize footer text/link.
    *   Default: "Powered by [Quick Card](https://quickcard.co.ke/)" (or similar).
*   **Favicon:** Upload custom favicon.
*   **Bookmark Image:** Upload custom image for home screen shortcut icon.
*   **Card Templates:** Offer several pre-designed card templates.
*   **Country-Specific Designs:** (Optional Feature) Explore templates reflecting design styles associated with different countries/regions.

## VI. Sharing & Accessibility

*   **Share Button:** Options to share card link via:
    *   Copy Link
    *   SMS
    *   Email
    *   Social Media (WhatsApp, Facebook, Twitter, LinkedIn)
*   **QR Code:**
    *   Generate QR code dynamically linking to the card URL.
    *   Provide button to download QR code image (PNG/SVG).
    *   Include QR code visually on the card itself (optional toggle?).

## VII. User Account & Dashboard

*   **Authentication:**
    *   Sign Up / Login page.
    *   Prompt to Sign Up/Login when saving/publishing a card without an account.
*   **User Dashboard:**
    *   **My Cards:** List, create, edit, delete cards. View card status (Active/Inactive).
    *   **Analytics:**
        *   Total Views/Scans
        *   Link Clicks (track clicks on primary/secondary/featured links)
        *   Contact Saves (.vcf downloads)
        *   Geographic location of views (optional)
        *   Referrer sources (optional)
    *   **Account Settings:** Manage profile, subscription, payment methods.
*   **Card Creation/Editing Interface:** WYSIWYG or form-based editor with live preview.

## VIII. Pricing & Payments

*   **Plans:**
    *   Monthly: Ksh 300
    *   6 Months: Ksh 1600
    *   Yearly: Ksh 3600 (Mark as "Best Value")
*   **Payment Integration:** Integrate with a payment gateway (e.g., Stripe, M-Pesa Daraja API, Peach Payments) supporting Kenyan Shillings (Ksh).
*   **Subscription Management:**
    *   Handle recurring payments.
    *   Grace period for late payments.
    *   **Auto-Deactivate Cards:** If payment fails after the grace period, deactivate the public card URL (show a "Card Unavailable" message). Reactivate upon successful payment.
*   **Pricing Selection:** Modal/Popup during the "Save & Publish" flow prompting users to select a plan.

## IX. Admin Dashboard

*   **User Management:** View list of users, search, view user details (cards, subscription status).
*   **Card Management:** View all created cards, potentially manage/troubleshoot specific cards.
*   **Subscription Monitoring:** Overview of active subscriptions, failed payments, revenue.
*   **Analytics Overview:** Aggregated platform analytics.

## X. Technical Considerations

*   **Frontend:** Next.js, React, TypeScript, Tailwind CSS (based on existing files).
*   **UI Components:** Utilize existing Shadcn UI components and create new ones as needed.
*   **State Management:** React Context API or Zustand/Jotai for managing card editor state and user session.
*   **Backend:** Choose a backend solution:
    *   **Firebase/Supabase:** Good for auth, database (Firestore/PostgreSQL), storage.
    *   **Custom Backend (Node.js/Express/etc.):** More flexibility but more setup.
*   **Database:** Store user data, card details, analytics, subscription status.
*   **Image/Media Storage:** Cloud storage (Firebase Storage, AWS S3, Cloudinary).
*   **QR Code Generation:** Use a library like `qrcode.react` or `node-qrcode`.
*   **vCard Generation:** Use a library like `vcards-js`.
*   **Analytics Tracking:** Implement custom tracking or integrate with a service like Google Analytics / Plausible / Umami.
*   **Payment Gateway Integration:** Use the chosen provider's SDK/API.

## XI. Next Steps (Initial Implementation Ideas)

1.  **Setup Backend:** Choose and set up the backend service (e.g., Supabase/Firebase) for Authentication, Database, and Storage.
2.  **Core Card Component:** Create the main React component for displaying the card (`src/components/business-card.tsx`).
3.  **Card Editor UI:** Design and build the card creation/editing page (`src/app/dashboard/cards/[cardId]/edit/page.tsx` or similar).
4.  **User Authentication:** Implement Sign Up, Login, and session management.
5.  **Database Schema:** Define the database structure for users and cards.
6.  **Basic Card Saving:** Implement functionality to save card data to the database.
7.  **Public Card Page:** Create the dynamic page to display a public card (`src/app/[username]/[card_slug]/page.tsx`).

