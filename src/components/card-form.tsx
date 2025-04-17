"use client";

import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form'; // Import Controller
import { zodResolver } from '@hookform/resolvers/zod';
import { CardFormData, cardFormSchema, defaultCardFormValues } from '@/lib/validators/cardFormSchema';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Trash2, PlusCircle } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import { ColorPicker } from '@/components/ui/color-picker'; // Import ColorPicker

// TODO: Add Avatar Suggestions/Generator

interface CardFormProps {
    onSubmit: (data: CardFormData) => Promise<void>;
    initialData?: Partial<CardFormData>;
    isLoading?: boolean;
    submitButtonText?: string;
}

export const CardForm: React.FC<CardFormProps> = ({ onSubmit, initialData, isLoading, submitButtonText = "Save Card" }) => {
    const form = useForm<CardFormData>({
        resolver: zodResolver(cardFormSchema),
        defaultValues: initialData ? { ...defaultCardFormValues, ...initialData } : defaultCardFormValues,
        mode: 'onChange',
    });

    const { fields: primaryActions, append: appendPrimaryAction, remove: removePrimaryAction } =
        useFieldArray({ control: form.control, name: "primaryActions" });

    const { fields: secondaryActions, append: appendSecondaryAction, remove: removeSecondaryAction } =
        useFieldArray({ control: form.control, name: "secondaryActions" });

    const { fields: featuredContent, append: appendFeaturedContent, remove: removeFeaturedContent } =
        useFieldArray({ control: form.control, name: "featuredContent" });

    const handleFormSubmit = form.handleSubmit(async (data) => {
        await onSubmit(data);
    });

    const getAvailableSocialPlatforms = () => {
        const usedPlatforms = secondaryActions.map(action => action.platform);
        const allPlatforms: CardFormData['secondaryActions'][number]['platform'][] = ['linkedin', 'facebook', 'twitter', 'github', 'instagram', 'youtube', 'tiktok', 'threads', 'behance', 'dribbble', 'cashapp', 'paypal'];
        return allPlatforms.filter(p => !usedPlatforms.includes(p));
    };

    return (
        <Form {...form}>
            <form onSubmit={handleFormSubmit} className="space-y-8">

                {/* Section: Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Enter the core details for your card.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* ... (First Name, Last Name, Job Title, Business Name fields remain the same) ... */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name *</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={form.control} name="jobTitle" render={({ field }) => (<FormItem><FormLabel>Job Title</FormLabel><FormControl><Input placeholder="CEO / Software Engineer" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="businessName" render={({ field }) => (<FormItem><FormLabel>Business Name</FormLabel><FormControl><Input placeholder="Acme Inc." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField
                            control={form.control}
                            name="businessDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Business Description (Max 500 chars)</FormLabel>
                                    <FormControl><Textarea placeholder="Tell us about your business..." {...field} maxLength={500} /></FormControl>
                                    <FormDescription>{field.value?.length || 0}/500 characters</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="cardSlug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Card URL Slug *</FormLabel>
                                    <FormControl><Input placeholder="john-doe-card" {...field} disabled={!!initialData} /></FormControl> {/* Disable slug editing for existing cards */}
                                    <FormDescription>Unique identifier for your card URL. Cannot be changed after creation.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Section: Contact Details */}
                <Card>
                    {/* ... (Contact Address fields remain the same) ... */}
                    <CardHeader>
                        <CardTitle>Contact Address</CardTitle>
                        <CardDescription>Optional business address details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="businessAddress" render={({ field }) => (<FormItem><FormLabel>Street Address</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Nairobi" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>State / County</FormLabel><FormControl><Input placeholder="Nairobi County" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="postalCode" render={({ field }) => (<FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input placeholder="00100" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="Kenya" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    </CardContent>
                </Card>

                {/* Section: Visuals (Using ImageUpload) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Visual Elements</CardTitle>
                        <CardDescription>Upload images for your card.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="headshotImageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Headshot Image</FormLabel>
                                    <FormControl>
                                        <ImageUpload
                                            fieldName="headshot"
                                            value={field.value}
                                            onChange={field.onChange}
                                            folderPath="card-images/headshots"
                                        />
                                    </FormControl>
                                    <FormDescription>Recommended: Square (e.g., 300x300px). JPG, PNG, GIF up to 5MB.</FormDescription>
                                    {/* TODO: Add Avatar Suggestions/Generator here */}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="headerImageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Header Image (Optional)</FormLabel>
                                    <FormControl>
                                        <ImageUpload
                                            fieldName="header"
                                            value={field.value}
                                            onChange={field.onChange}
                                            folderPath="card-images/headers"
                                        />
                                    </FormControl>
                                    <FormDescription>Recommended: Wide rectangle (e.g., 600x200px). JPG, PNG, GIF up to 5MB.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* TODO: Add toggle/logic to choose between Cover and Brand Logo */}
                        <FormField
                            control={form.control}
                            name="coverImageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cover Image (Optional)</FormLabel>
                                    <FormControl>
                                        <ImageUpload
                                            fieldName="cover"
                                            value={field.value}
                                            onChange={field.onChange}
                                            folderPath="card-images/covers"
                                        />
                                    </FormControl>
                                    <FormDescription>Recommended: Wide banner (e.g., 1080x300px). JPG, PNG, GIF up to 5MB.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="brandImageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Brand Logo (Optional, alternative to Cover)</FormLabel>
                                    <FormControl>
                                        <ImageUpload
                                            fieldName="brandLogo"
                                            value={field.value}
                                            onChange={field.onChange}
                                            folderPath="card-images/logos"
                                        />
                                    </FormControl>
                                    <FormDescription>Recommended: Square (e.g., 300x300px). JPG, PNG, GIF up to 5MB.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Section: Primary Actions */}
                <Card>
                    {/* ... (Primary Actions fields remain the same) ... */}
                    <CardHeader>
                        <CardTitle>Primary Actions</CardTitle>
                        <CardDescription>Add up to 2 main contact methods or links.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {primaryActions.map((field, index) => (
                            <div key={field.id} className="flex items-end space-x-2 border p-3 rounded-md">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-grow">
                                    <FormField control={form.control} name={`primaryActions.${index}.type`} render={({ field }) => (<FormItem><FormLabel>Action Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="call">Call</SelectItem><SelectItem value="whatsapp">WhatsApp</SelectItem><SelectItem value="email">Email</SelectItem><SelectItem value="website">Website</SelectItem><SelectItem value="booking">Booking Calendar</SelectItem><SelectItem value="location">Location (Map Link)</SelectItem><SelectItem value="store_name">Store Name (Text)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name={`primaryActions.${index}.label`} render={({ field }) => (<FormItem><FormLabel>Button Label</FormLabel><FormControl><Input placeholder="e.g., Call Mobile, Visit Site" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name={`primaryActions.${index}.value`} render={({ field }) => (<FormItem><FormLabel>Value (Number/URL/Email)</FormLabel><FormControl><Input placeholder="+2547... / https://..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removePrimaryAction(index)} aria-label="Remove Action"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        ))}
                        {primaryActions.length < 2 && (<Button type="button" variant="outline" size="sm" onClick={() => appendPrimaryAction({ type: 'call', label: '', value: '' })}><PlusCircle className="h-4 w-4 mr-2" /> Add Primary Action</Button>)}
                        <FormMessage>{form.formState.errors.primaryActions?.root?.message}</FormMessage>
                    </CardContent>
                </Card>

                {/* Section: Secondary Actions (Social Links) */}
                <Card>
                    {/* ... (Secondary Actions fields remain the same) ... */}
                    <CardHeader>
                        <CardTitle>Social Media Links</CardTitle>
                        <CardDescription>Add links to your social profiles.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {secondaryActions.map((field, index) => (
                            <div key={field.id} className="flex items-end space-x-2 border p-3 rounded-md">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-grow">
                                    <FormField control={form.control} name={`secondaryActions.${index}.platform`} render={({ field }) => (<FormItem><FormLabel>Platform</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select platform..." /></SelectTrigger></FormControl><SelectContent>{field.value && <SelectItem value={field.value}>{field.value}</SelectItem>}{getAvailableSocialPlatforms().map(platform => (<SelectItem key={platform} value={platform}>{platform}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name={`secondaryActions.${index}.url`} render={({ field }) => (<FormItem><FormLabel>Profile URL</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeSecondaryAction(index)} aria-label="Remove Social Link"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        ))}
                        {getAvailableSocialPlatforms().length > 0 && (<Button type="button" variant="outline" size="sm" onClick={() => appendSecondaryAction({ platform: getAvailableSocialPlatforms()[0], url: '' })}><PlusCircle className="h-4 w-4 mr-2" /> Add Social Link</Button>)}
                    </CardContent>
                </Card>

                {/* Section: Featured Content */}
                <Card>
                    {/* ... (Featured Content fields remain the same, maybe add ImageUpload for type=media/product) ... */}
                    <CardHeader>
                        <CardTitle>Featured Content (Optional)</CardTitle>
                        <CardDescription>Showcase products, videos, links, or other media.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {featuredContent.map((field, index) => (
                            <div key={field.id} className="border p-4 rounded-md space-y-3">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold">Item {index + 1}</h4>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFeaturedContent(index)} aria-label="Remove Featured Item"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                                <FormField control={form.control} name={`featuredContent.${index}.type`} render={({ field }) => (<FormItem><FormLabel>Content Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="media">Media (Image)</SelectItem><SelectItem value="product">Product</SelectItem><SelectItem value="cta">Custom Button (CTA)</SelectItem><SelectItem value="video">YouTube Video</SelectItem><SelectItem value="link">Simple Link</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`featuredContent.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., My Product, Latest Video" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`featuredContent.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Short description..." {...field} /></FormControl><FormMessage /></FormItem>)} />

                                {/* Conditionally show fields, including ImageUpload for media/product */}
                                {(form.watch(`featuredContent.${index}.type`) === 'media' || form.watch(`featuredContent.${index}.type`) === 'product') && (
                                    <FormField
                                        control={form.control}
                                        name={`featuredContent.${index}.imageUrl`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Image</FormLabel>
                                                <FormControl>
                                                    <ImageUpload
                                                        fieldName={`featured_${index}`}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        folderPath="card-images/featured"
                                                    />
                                                </FormControl>
                                                <FormDescription>Upload image for media/product. JPG, PNG, GIF up to 5MB.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                {form.watch(`featuredContent.${index}.type`) === 'product' && (
                                    <FormField control={form.control} name={`featuredContent.${index}.linkUrl`} render={({ field }) => (<FormItem><FormLabel>Product Link URL</FormLabel><FormControl><Input type="url" placeholder="https://.../product-page" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                )}
                                {form.watch(`featuredContent.${index}.type`) === 'cta' && (
                                    <>
                                        <FormField control={form.control} name={`featuredContent.${index}.linkUrl`} render={({ field }) => (<FormItem><FormLabel>Button Link URL</FormLabel><FormControl><Input type="url" placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name={`featuredContent.${index}.buttonText`} render={({ field }) => (<FormItem><FormLabel>Button Text</FormLabel><FormControl><Input placeholder="e.g., Learn More, Shop Now" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </>
                                )}
                                {form.watch(`featuredContent.${index}.type`) === 'video' && (
                                    <FormField control={form.control} name={`featuredContent.${index}.videoUrl`} render={({ field }) => (<FormItem><FormLabel>YouTube Video URL</FormLabel><FormControl><Input type="url" placeholder="https://www.youtube.com/watch?v=..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                )}
                                {form.watch(`featuredContent.${index}.type`) === 'link' && (
                                    <FormField control={form.control} name={`featuredContent.${index}.linkUrl`} render={({ field }) => (<FormItem><FormLabel>Link URL</FormLabel><FormControl><Input type="url" placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                )}
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendFeaturedContent({ type: 'link', title: '', description: '', linkUrl: '' })}>
                            <PlusCircle className="h-4 w-4 mr-2" /> Add Featured Content
                        </Button>
                    </CardContent>
                </Card>

                {/* Section: Customization */}
                <Card>
                    {/* ... (Customization fields now use ColorPicker) ... */}
                    <CardHeader>
                        <CardTitle>Customization</CardTitle>
                        <CardDescription>Personalize the look and feel of your card.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="headerBackgroundColor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Header Background Color</FormLabel>
                                        <FormControl>
                                            <ColorPicker value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="bodyBackgroundColor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Body Background Color</FormLabel>
                                        <FormControl>
                                            <ColorPicker value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="textColor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Text Color</FormLabel>
                                        <FormControl>
                                            <ColorPicker value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="buttonBackgroundColor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Button Background Color</FormLabel>
                                        <FormControl>
                                            <ColorPicker value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="featuredContentBackgroundColor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Featured Content Background</FormLabel>
                                    <FormControl>
                                        <ColorPicker value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Section: Footer */}
                <Card>
                    {/* ... (Footer fields remain the same) ... */}
                    <CardHeader>
                        <CardTitle>Footer Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="showDefaultFooter" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Show "Powered by Quick Card" Footer</FormLabel></div></FormItem>)} />
                        {!form.watch("showDefaultFooter") && (
                            <>
                                <FormField control={form.control} name="customFooterText" render={({ field }) => (<FormItem><FormLabel>Custom Footer Text</FormLabel><FormControl><Input placeholder="Your Custom Footer" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="customFooterLink" render={({ field }) => (<FormItem><FormLabel>Custom Footer Link (Optional)</FormLabel><FormControl><Input type="url" placeholder="https://yourlink.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </>
                        )}
                    </CardContent>
                </Card>


                {/* Submit Button */}
                <div className="flex justify-end space-x-3">
                    {/* TODO: Add a Preview Button? */}
                    <Button type="submit" disabled={isLoading || !form.formState.isDirty || !form.formState.isValid}>
                        {isLoading ? "Saving..." : submitButtonText}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
