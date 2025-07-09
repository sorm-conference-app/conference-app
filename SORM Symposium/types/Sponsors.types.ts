export interface Sponsor {
  id: string;
  name: string;
  description: string;
  level: string;
  logo?: string | null;
  contact?: string;
  contactInfo: string;
  website?: string;
}

export interface SponsorGroup {
  level: string;
  sponsors: Sponsor[];
} 

export interface SponsorLogoIndex {
  map: Map<string, string>;
}