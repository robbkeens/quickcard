'use client';

import {useState} from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {generateTagline} from '@/ai/flows/tagline-suggestion';
import {useToast} from '@/hooks/use-toast';
import {useEffect} from 'react';
import {Icons} from '@/components/icons';
import {PaymentOption} from '@/services/payment';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

interface CardData {
  name: string;
  title: string;
  phone: string;
  email: string;
  website: string;
  linkedin: string;
  twitter: string;
  tagline: string;
  paymentOption: PaymentOption;
}

const defaultCardData: CardData = {
  name: 'John Doe',
  title: 'Software Engineer',
  phone: '123-456-7890',
  email: 'john.doe@example.com',
  website: 'example.com',
  linkedin: 'linkedin.com/in/johndoe',
  twitter: 'twitter.com/johndoe',
  tagline: 'Building the future, one line of code at a time.',
  paymentOption: 'Mpesa',
};

export default function Home() {
  const [cardData, setCardData] = useState<CardData>(defaultCardData);
  const {toast} = useToast();

  useEffect(() => {
    setCardData(defaultCardData);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target;
    setCardData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTaglineSuggestion = async () => {
    try {
      const result = await generateTagline({
        jobTitle: cardData.title,
        industry: 'Technology', // Hardcoded for now, can be a select later
      });
      setCardData(prev => ({
        ...prev,
        tagline: result.tagline,
      }));
      toast({
        title: 'Tagline Generated',
        description: 'A new tagline has been generated for your card.',
      });
    } catch (error: any) {
      console.error('Error generating tagline:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate tagline. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePaymentOptionChange = (value: PaymentOption) => {
    setCardData(prev => ({
      ...prev,
      paymentOption: value,
    }));
  };

  const handleShare = () => {
    // Implement share functionality (QR code, NFC, link)
    toast({
      title: 'Card Shared',
      description: 'Your digital business card has been shared!',
    });
  };

  return (
    <div className="container py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Create Your Digital Business Card</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-background shadow-md">
          <CardHeader>
            <CardTitle>Card Details</CardTitle>
            <CardDescription>Enter your information to create your digital card.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input type="text" id="name" name="name" value={cardData.name} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input type="text" id="title" name="title" value={cardData.title} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input type="tel" id="phone" name="phone" value={cardData.phone} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input type="email" id="email" name="email" value={cardData.email} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input type="url" id="website" name="website" value={cardData.website} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input type="url" id="linkedin" name="linkedin" value={cardData.linkedin} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input type="url" id="twitter" name="twitter" value={cardData.twitter} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Textarea id="tagline" name="tagline" value={cardData.tagline} onChange={handleChange} />
              <Button variant="secondary" onClick={handleTaglineSuggestion}>
                Suggest Tagline <Icons.workflow className="ml-2 h-4 w-4" />
              </Button>
            </div>
             <div className="grid gap-2">
              <Label htmlFor="paymentOption">Payment Option</Label>
                <Select value={cardData.paymentOption} onValueChange={handlePaymentOptionChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a payment option" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Mpesa">Mpesa</SelectItem>
                        <SelectItem value="Airtel Money">Airtel Money</SelectItem>
                        <SelectItem value="PayPal">PayPal</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background shadow-md">
          <CardHeader>
            <CardTitle>Your Card</CardTitle>
            <CardDescription>A preview of your digital business card.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">{cardData.name}</h2>
              <p className="text-muted-foreground">{cardData.title}</p>
              <p className="mt-2">{cardData.tagline}</p>
            </div>
            <div className="flex flex-col items-start">
              <p>
                <strong>Phone:</strong> <a href={`tel:${cardData.phone}`}>{cardData.phone}</a>
              </p>
              <p>
                <strong>Email:</strong> <a href={`mailto:${cardData.email}`}>{cardData.email}</a>
              </p>
              <p>
                <strong>Website:</strong> <a href={cardData.website} target="_blank" rel="noopener noreferrer">
                  {cardData.website}
                </a>
              </p>
              <div className="flex space-x-4 mt-4">
                <a href={cardData.linkedin} target="_blank" rel="noopener noreferrer">
                  <Icons.linkedin className="h-6 w-6" />
                </a>
                <a href={cardData.twitter} target="_blank" rel="noopener noreferrer">
                  <Icons.twitter className="h-6 w-6" />
                </a>
              </div>
            </div>
            <Button className="w-full" onClick={handleShare}>
              Share Card <Icons.share className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
