export interface Sponsor {
  id: string;
  name: string;
  description: string;
  level: string;
  logo?: string;
  contactInfo: string;
  website?: string;
}

export interface SponsorGroup {
  level: string;
  sponsors: Sponsor[];
} 