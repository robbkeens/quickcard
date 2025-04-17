import vCard from 'vcards-js';

export function createVCardString(
  firstName: string,
  lastName: string,
  jobTitle: string,
  businessName: string,
  businessAddress: string,
  city: string,
  state: string,
  postalCode: string,
  country: string,
  primaryPhone: string,
  primaryEmail: string,
  website: string,
  linkedinUrl: string,
  facebookUrl: string,
  twitterUrl: string,
  instagramUrl: string
): string {
  const vcard = new vCard();

  // Personal Information
  vcard.firstName = firstName || '';
  vcard.lastName = lastName || '';
  vcard.title = jobTitle || '';

  // Business Information
  vcard.organization = businessName || '';
  vcard.workAddress.street = businessAddress || '';
  vcard.workAddress.city = city || '';
  vcard.workAddress.state = state || '';
  vcard.workAddress.postalCode = postalCode || '';
  vcard.workAddress.country = country || '';

  // Contact Information
  vcard.phoneNumber = primaryPhone || '';
  vcard.email = primaryEmail || '';
  vcard.url = website || '';

  // Social Media Links
  vcard.socialUrls['linkedin'] = linkedinUrl || '';
  vcard.socialUrls['facebook'] = facebookUrl || '';
  vcard.socialUrls['twitter'] = twitterUrl || '';
  vcard.socialUrls['instagram'] = instagramUrl || '';

  return vcard.getVCard();
}