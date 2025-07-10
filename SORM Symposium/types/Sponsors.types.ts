export interface Sponsor {
  id: string;
  name: string;
  description: string;
  level: string;
  logo?: string | null;
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
  }[];
  website?: string;
}

export interface SponsorGroup {
  level: string;
  sponsors: Sponsor[];
} 

export interface SponsorLogoIndex {
  map: Map<string, string>;
}