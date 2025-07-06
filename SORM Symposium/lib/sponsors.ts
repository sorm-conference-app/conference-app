import { Sponsor, SponsorGroup } from "@/types/Sponsors.types";

// Sample sponsor data - replace with actual data from your backend
const sponsors: Sponsor[] = [
  {
    id: "1",
    name: "TechCorp Solutions",
    description: "Leading provider of innovative technology solutions for modern businesses. Specializing in cloud infrastructure and digital transformation.",
    level: "Ultra-Resilient",
    logo: "https://via.placeholder.com/150x150/FFD700/000000?text=TC",
    contactInfo: "contact@techcorp.com",
    website: "https://techcorp.com"
  },
  {
    id: "2",
    name: "InnovateSoft",
    description: "Cutting-edge software development company focused on creating scalable applications and digital experiences.",
    level: "Ultra-Resilient",
    logo: "https://via.placeholder.com/150x150/FFD700/000000?text=IS",
    contactInfo: "hello@innovatesoft.com",
    website: "https://innovatesoft.com"
  },
  {
    id: "3",
    name: "DataFlow Systems",
    description: "Enterprise data management and analytics platform provider, helping organizations make data-driven decisions.",
    level: "Resilient",
    logo: "https://via.placeholder.com/150x150/C0C0C0/000000?text=DF",
    contactInfo: "info@dataflow.com",
    website: "https://dataflow.com"
  },
  {
    id: "4",
    name: "CloudNet Pro",
    description: "Professional cloud networking services and infrastructure solutions for growing businesses.",
    level: "Resilient",
    logo: "https://via.placeholder.com/150x150/C0C0C0/000000?text=CN",
    contactInfo: "support@cloudnetpro.com",
    website: "https://cloudnetpro.com"
  },
  {
    id: "5",
    name: "SecureTech",
    description: "Cybersecurity solutions provider specializing in protecting digital assets and ensuring compliance.",
    level: "TBD",
    logo: "https://via.placeholder.com/150x150/CD7F32/000000?text=ST",
    contactInfo: "security@securetech.com",
    website: "https://securetech.com"
  }
];

export function getSponsorsByLevel(): SponsorGroup[] {
  const levels = ["Ultra-Resilient", "Resilient", "TBD"];
  
  return levels.map(level => ({
    level,
    sponsors: sponsors.filter(sponsor => sponsor.level === level)
  }));
}

export function getAllSponsors(): Sponsor[] {
  return sponsors;
}

export function getSponsorById(id: string): Sponsor | undefined {
  return sponsors.find(sponsor => sponsor.id === id);
} 