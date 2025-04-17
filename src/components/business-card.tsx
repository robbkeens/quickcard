"use client";

import React, { useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileDown, Phone, Mail, Globe, MapPin, MessageCircle, Calendar, Store, Linkedin, Facebook, Twitter, Github, Instagram, Youtube, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import vCard from 'vcards-js';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

// --- Data Structure (Props) ---
interface ActionButton {
    type: 'call' | 'whatsapp' | 'email' | 'website' | 'booking' | 'location' | 'store_name';
    label: string;
    value: string;
    icon?: React.ReactNode;
}

interface SocialLink {
    platform: 'linkedin' | 'facebook' | 'twitter' | 'github' | 'instagram' | 'youtube' | 'tiktok' | 'threads' | 'behance' | 'dribbble' | 'cashapp' | 'paypal';
    url: string;
    icon?: React.ReactNode;
}

interface FeaturedContentItem {
    type: 'media' | 'product' | 'cta' | 'video' | 'link';
    title?: string;
    description?: string;
    imageUrl?: string;
    linkUrl?: string;
    buttonText?: string;
    videoUrl?: string;
}

// Main Props for the Business Card Component
export interface BusinessCardProps {
    cardSlug: string;
    userId: string;
    headerImageUrl?: string;
    coverImageUrl?: string;
    brandImageUrl?: string;
    headshotImageUrl?: string;
    headshotSuggestionUrl?: string;
    firstName: string;
    lastName: string;
    jobTitle?: string;
    businessName?: string;
    businessAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    businessDescription?: string;
    primaryActions: ActionButton[];
    secondaryActions: SocialLink[];
    featuredContent?: FeaturedContentItem[];
    headerBackgroundColor?: string;
    bodyBackgroundColor?: string;
    buttonBackgroundColor?: string;
    buttonStyle?: 'solid' | 'outline' | 'gradient';
    featuredContentBackgroundColor?: string;
    textColor?: string;
    customFooterText?: string;
    customFooterLink?: string;
    showDefaultFooter?: boolean;
}

// --- Helper Components ---
const ActionButtonRenderer: React.FC<{ action: ActionButton; userId: string; cardSlug: string }> = ({ action, userId, cardSlug }) => {
    let href = '';
    let Icon = LinkIcon;

    const handleClick = useCallback(async () => {
        try {
            // Increment click count in Firestore
            const cardRef = doc(db, 'users', userId, 'cards', cardSlug);
            await updateDoc(cardRef, { [`clicks.${action.type}`]: increment(1) });
        } catch (error) {
            console.error("Error incrementing click count: ", error);
        }
        window.open(href, '_blank');
    }, [action.type, href, userId, cardSlug]);

    switch (action.type) {
        case 'call':
            href = `tel:${action.value}`;
            Icon = Phone;
            break;
        case 'whatsapp':
            href = `https://wa.me/${action.value.replace(/\D/g, '')}`;
            Icon = MessageCircle;
            break;
        case 'email':
            href = `mailto:${action.value}`;
            Icon = Mail;
            break;
        case 'website':
        case 'booking':
        case 'location':
            href = action.value.startsWith('http') ? action.value : `https://${action.value}`;
            Icon = action.type === 'website' ? Globe : action.type === 'booking' ? Calendar : MapPin;
            break;
        case 'store_name':
            return <div className="flex items-center space-x-2 p-2"><Store className="h-4 w-4" /><span>{action.value}</span></div>;
        default:
            href = '#';
    }

    return (
        <Button variant="outline" className="flex-1" onClick={handleClick}>
            <a className="flex items-center justify-center space-x-2">
                <Icon className="h-4 w-4" />
                <span>{action.label}</span>
            </a>
        </Button>
    );
};

const SocialLinkRenderer: React.FC<{ social: SocialLink; userId: string; cardSlug: string }> = ({ social, userId, cardSlug }) => {
    const handleClick = useCallback(async () => {
        try {
            // Increment click count in Firestore
            const cardRef = doc(db, 'users', userId, 'cards', cardSlug);
            await updateDoc(cardRef, { [`clicks.${social.platform}`]: increment(1) });
        } catch (error) {
            console.error("Error incrementing click count: ", error);
        }
        window.open(social.url, '_blank');
    }, [social.platform, social.url, userId, cardSlug]);

    return (
        <a
            key={social.platform}
            href={social.url.startsWith('http') ? social.url : `https://${social.url}`}
            target="_blank"
            rel="noopener noreferrer"
            title={social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={handleClick}
        >
            {socialIconMap[social.platform] || <LinkIcon className="h-5 w-5" />} {/* Fallback icon */}
        </a>
    );
};


const socialIconMap: { [key in SocialLink['platform']]?: React.ReactNode } = {
    linkedin: <Linkedin className="h-5 w-5" />,
    facebook: <Facebook className="h-5 w-5" />,
    twitter: <Twitter className="h-5 w-5" />,
    github: <Github className="h-5 w-5" />,
    instagram: <Instagram className="h-5 w-5" />,
    youtube: <Youtube className="h-5 w-5" />,
    behance: <span className="font-bold">Be</span>,
    tiktok: <span className="font-bold">Ti</span>,
    threads: <span className="font-bold">Th</span>,
    dribbble: <span className="font-bold">Dr</span>,
    cashapp: <span className="font-bold">$</span>,
    paypal: <span className="font-bold">Pp</span>,
};

// --- Main Business Card Component ---
const BusinessCard: React.FC<BusinessCardProps> = (props) => {
    const {
        headerImageUrl,
        coverImageUrl,
        brandImageUrl,
        headshotImageUrl,
        headshotSuggestionUrl,
        firstName,
        lastName,
        jobTitle,
        businessName,
        businessAddress,
        city,
        state,
        postalCode,
        country,
        businessDescription,
        primaryActions = [],
        secondaryActions = [],
        featuredContent = [],
        headerBackgroundColor = 'bg-gray-200 dark:bg-gray-700',
        bodyBackgroundColor = 'bg-white dark:bg-gray-800',
        featuredContentBackgroundColor = 'bg-gray-50 dark:bg-gray-750',
        textColor = 'text-gray-900 dark:text-gray-100',
        customFooterText,
        customFooterLink,
        showDefaultFooter = true,
        userId,
        cardSlug
    } = props;

    const fallbackName = `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
    const displayHeadshot = headshotImageUrl || headshotSuggestionUrl;
    const displayCover = coverImageUrl || brandImageUrl;
    const fullAddress = [businessAddress, city, state, postalCode, country].filter(Boolean).join(', ');

    const vCardString = useMemo(() => {
        const card = vCard();

        // Personal Information
        card.firstName = firstName || '';
        card.lastName = lastName || '';
        card.title = jobTitle || '';

        // Business Information
        card.organization = businessName || '';
        card.workAddress.street = businessAddress || '';
        card.workAddress.city = city || '';
        card.workAddress.state = state || '';
        card.workAddress.postalCode = postalCode || '';
        card.workAddress.country = country || '';

        // Actions (Phone, Email, Website)
        primaryActions.forEach(action => {
            if (action.type === 'call') {
                card.phoneNumber = action.value;
            } else if (action.type === 'email') {
                card.email = action.value;
            } else if (action.type === 'website') {
                card.url = action.value;
            }
        });

        // Social Media Links (Add more as needed)
        secondaryActions.forEach(social => {
            if (social.platform === 'linkedin') {
                card.socialUrls['linkedin'] = social.url;
            } else if (social.platform === 'facebook') {
                card.socialUrls['facebook'] = social.url;
            } else if (social.platform === 'twitter') {
                card.socialUrls['twitter'] = social.url;
            } else if (social.platform === 'instagram') {
                card.socialUrls['instagram'] = social.url;
            }
        });

        return card.getVCard();
    }, [firstName, lastName, jobTitle, businessName, businessAddress, city, state, postalCode, country, primaryActions, secondaryActions]);

    const vCardDataUrl = useMemo(() => {
        return `data:text/vcard;charset=utf-8,${encodeURIComponent(vCardString)}`;
    }, [vCardString]);

    return (
        <div className={cn("max-w-md mx-auto rounded-lg overflow-hidden shadow-lg", bodyBackgroundColor, textColor)}>
            {/* --- Header Section --- */}
            {headerImageUrl && (
                <div className={cn("h-24 md:h-32", headerBackgroundColor)}>
                    <Image
                        src={headerImageUrl}
                        alt={`${businessName || 'Card'} Header`}
                        width={600}
                        height={200}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* --- Cover/Brand Image Section --- */}
            {displayCover && (
                <div className={cn("relative", !headerImageUrl ? 'pt-0' : '')}>
                    <Image
                        src={displayCover}
                        alt={`${businessName || 'Card'} ${coverImageUrl ? 'Cover' : 'Brand'}`}
                        width={coverImageUrl ? 1080 : 300}
                        height={coverImageUrl ? 300 : 300}
                        className={`w-full ${coverImageUrl ? 'h-32 md:h-40 object-cover' : 'h-24 w-24 mx-auto mt-4 rounded-full object-contain'}`}
                    />
                </div>
            )}

            {/* --- Headshot & Core Info Section --- */}
            <div className="relative px-4 pb-4 pt-2 flex flex-col items-center text-center">
                <div className={cn("mb-2", displayCover ? '-mt-12' : 'mt-4')}>
                    <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-md">
                        <AvatarImage src={displayHeadshot} alt={`${firstName} ${lastName} Headshot`} />
                        <AvatarFallback>{fallbackName}</AvatarFallback>
                    </Avatar>
                </div>

                <h1 className="text-2xl font-bold">{firstName} {lastName}</h1>
                {jobTitle && <p className="text-md text-gray-600 dark:text-gray-400">{jobTitle}</p>}
                {businessName && <p className="text-lg font-semibold mt-1">{businessName}</p>}
                {fullAddress && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{fullAddress}</p>}
                {businessDescription && <p className="text-sm mt-3 text-left px-2">{businessDescription}</p>}
            </div>

            <Separator className="my-2" />

            {/* --- Primary Actions Section --- */}
            {primaryActions.length > 0 && (
                <div className="px-4 py-2 flex space-x-2">
                    {primaryActions.slice(0, 2).map((action, index) => (
                        <ActionButtonRenderer key={`${action.type}-${index}`} action={action}  userId={userId} cardSlug={cardSlug}/>
                    ))}
                </div>
            )}

            {/* --- Save Contact Button --- */}
            <div className="px-4 py-2">
                <Button asChild variant="default" className="w-full">
                    <a href={vCardDataUrl} download={`${firstName}_${lastName}_contact.vcf`}>
                        Save Contact
                        <FileDown className='h-4 w-4 ml-2' />
                    </a>
                </Button>
            </div>

            {/* --- Secondary Actions (Social Media) Section --- */}
            {secondaryActions.length > 0 && (
                <>
                    <Separator className="my-2" />
                    <div className="px-4 py-2">
                        <div className="flex flex-wrap justify-center gap-3">
                            {secondaryActions.map((social) => (
                                 <SocialLinkRenderer key={social.platform} social={social} userId={userId} cardSlug={cardSlug} />
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* --- Featured Content Section --- */}
            {featuredContent.length > 0 && (
                <div className={cn("mt-2 pt-3 pb-1", featuredContentBackgroundColor)}>
                    <h2 className="text-lg font-semibold mb-2 text-center px-4">Featured</h2>
                    <div className="space-y-3 px-4 pb-3">
                        {featuredContent.map((item, index) => (
                            <div key={index} className="border rounded-md p-3 bg-white dark:bg-gray-800 shadow-sm">
                                {item.type === 'video' && item.videoUrl && (
                                    <div className="aspect-w-16 aspect-h-9 mb-2 rounded overflow-hidden">
                                        <iframe
                                            src={item.videoUrl.replace("watch?v=", "embed/")}
                                            title={item.title || "Featured Video"}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-full"
                                        ></iframe>
                                    </div>
                                )}
                                {item.imageUrl && item.type !== 'video' && (
                                    <Image src={item.imageUrl} alt={item.title || 'Featured Image'} width={400} height={200} className="w-full h-auto object-cover rounded mb-2" />
                                )}
                                {item.title && <h3 className="font-semibold">{item.title}</h3>}
                                {item.description && <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>}
                                {(item.type === 'cta' || item.type === 'link' || item.type === 'product') && item.linkUrl && (
                                    <Button asChild variant="link" size="sm" className="p-0 h-auto mt-1">
                                        <a href={item.linkUrl.startsWith('http') ? item.linkUrl : `https://${item.linkUrl}`} target="_blank" rel="noopener noreferrer">
                                            {item.buttonText || item.title || 'Learn More'} <LinkIcon className="h-3 w-3 ml-1" />
                                        </a>
                                    </Button>
                                )}

                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- Footer Section --- */}
            <Separator className="my-0" />
            <div className="px-4 py-3 text-center text-xs text-gray-500 dark:text-gray-400">
                {customFooterText ? (
                    customFooterLink ? <a href={customFooterLink} target="_blank" rel="noopener noreferrer" className="hover:underline">{customFooterText}</a> : customFooterText
                ) : showDefaultFooter ? (
                    <>Powered by <a href="https://quickcard.co.ke/" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">Quick Card</a></>
                ) : null}
            </div>
        </div>
    );
};

export default BusinessCard;
