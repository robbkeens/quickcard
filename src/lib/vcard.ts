import vCard from 'vcards-js';
import { CardFormData } from '@/lib/validators/cardFormSchema';

export const generateVCard = (data: CardFormData): string => {
  const vcard = vCard();

  // Personal Information
  vcard.firstName = data.firstName || '';
  vcard.lastName = data.lastName || '';
  vcard.title = data.jobTitle || '';
  vcard.organization = data.businessName || '';
  vcard.note = data.businessDescription || '';

  // Business Address
  if (data.businessAddress) {
    vcard.homeAddress.street = data.businessAddress || '';
    vcard.homeAddress.city = data.city || '';
    vcard.homeAddress.state = data.state || '';
    vcard.homeAddress.postalCode = data.postalCode || '';
    vcard.homeAddress.countryRegion = data.country || '';
  }

  // Primary Actions (Phone, Email, Website)
  data.primaryActions?.forEach(action => {
    switch (action.type) {
      case 'call':
        vcard.cellPhone = action.value || '';
        break;
      case 'whatsapp':
        // You might want to format the number correctly for international use
        vcard.cellPhone = action.value || '';
        break;
      case 'email':
        vcard.email = action.value || '';
        break;
      case 'website':
        vcard.url = action.value || '';
        break;
      // Add other primary action types as needed
    }
  });

  // Social Media Links (Add as URLs)
  data.secondaryActions?.forEach(action => {
    vcard.url = action.url || ''; // Overwrites previous URL, can only store one. Can use note to add social media links
    vcard.note += `${action.platform}: ${action.url}
`
  });

  return vcard.getFormattedString();
};
