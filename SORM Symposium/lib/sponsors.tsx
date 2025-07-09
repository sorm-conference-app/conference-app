import React from "react";
import { Sponsor, SponsorGroup, SponsorLogoIndex } from "@/types/Sponsors.types";

// Sample sponsor data - replace with actual data from your backend
const sponsors: Sponsor[] = [
  {
    id: "1",
    name: "Institute for Homeland Security at Sam Houston State University",
    description: "The Institute for Homeland Security at Sam Houston State University fosters strategic private-public partnerships through education, research, and professional development to strengthen Texas's critical infrastructure sectors—Transportation, Energy, Chemical, Water/Wastewater, and Healthcare. By advancing security, resilience, and continuity, the Institute partners with practitioners to protect what matters most while seeking the continuity of critical lifeline functions across the state.",
    level: "Ultra-Resilient",
    logo: "../assets/images/SponsorLogos/IHSMainLogo.png", 
    contact: "Robert Crane, MBA, CBCP, Program Executive for Public Sector Engagements, Energy Security, and PNT",
    contactInfo: "rec057@shsu.edu",
    website: "https://ihsonline.org/"
  },
  {
    id: "2",
    name: "InnovateSoft",
    description: "Cutting-edge software development company focused on creating scalable applications and digital experiences.",
    level: "Ultra-Resilient",
    logo: null, 
    contactInfo: "hello@innovatesoft.com",
    website: "https://innovatesoft.com"
  },
  {
    id: "3",
    name: "DataFlow Systems",
    description: "Enterprise data management and analytics platform provider, helping organizations make data-driven decisions.",
    level: "Resilient",
    logo: null, 
    contactInfo: "info@dataflow.com",
    website: "https://dataflow.com"
  },
  {
    id: "4",
    name: "CloudNet Pro",
    description: "Professional cloud networking services and infrastructure solutions for growing businesses.",
    level: "Resilient",
    logo: null, 
    contactInfo: "support@cloudnetpro.com",
    website: "https://cloudnetpro.com"
  },
  {
    id: "5",
    name: "SecureTech",
    description: "Cybersecurity solutions provider specializing in protecting digital assets and ensuring compliance.",
    level: "TBD",
    logo: null, 
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