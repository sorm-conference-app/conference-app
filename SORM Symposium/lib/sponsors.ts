import { Sponsor, SponsorGroup } from "@/types/Sponsors.types";

// Sample sponsor data - replace with actual data from your backend
const sponsors: Sponsor[] = [
  {
    id: "1",
    name: "Institute for Homeland Security at Sam Houston State University",
    description:
      "The Institute for Homeland Security at Sam Houston State University fosters strategic private-public partnerships through education, research, and professional development to strengthen Texas's critical infrastructure sectors—Transportation, Energy, Chemical, Water/Wastewater, and Healthcare. By advancing security, resilience, and continuity, the Institute partners with practitioners to protect what matters most while seeking the continuity of critical lifeline functions across the state.",
    level: "Ultra-Resilient",
    logo: "../assets/images/SponsorLogos/IHSMainLogo.png",
    contactInfo: [
      {
        name: "Robert Crane, MBA, CBCP, Program Executive for Public Sector Engagements, Energy Security, and PNT",
        email: "rec057@shsu.edu",
        phone: "",
      },
    ],
    website: "https://ihsonline.org/",
  },
  {
    id: "2",
    name: "BELFOR Property Restoration",
    description:
      "With 9 local Texas offices, BELFOR is the world's largest property restoration company handling every aspect of a disaster after a water, fire or storm event.  BELFOR responds quickly to the emergency, including board-ups, water extraction, demo, asbestos abatements, mold remediations, document and electronics restoration, contents packouts, as well as reconstruction.",
    level: "Ultra-Resilient",
    logo: "../assets/images/SponsorLogos/BelforPropRest.jpg",
    contactInfo: [
      {
        name: "BELFOR Property Restoration",
        email: "",
        phone: "800-856-3333",
      },
      {
        name: "Tammy Kleine",
        email: "Tammy.Kleine@us.BELFOR.com",
        phone: "254-405-4833",
      },
      {
        name: "Alex Wilson",
        email: "Alex.Wilson@us.BELFOR.com",
        phone: "254-299-3267",
      },
      {
        name: "Bobby Templeton",
        email: "Bobby.Templeton@us.BELFOR.com",
        phone: "830-928-3470",
      },
    ],
    website: "https://www.BELFOR.com",
  },
  {
    id: "3",
    name: "Gallagher",
    description: "Welcome to Gallagher: A leading global insurance brokerage, risk management, and consulting firm founded in 1927",
    level: "Ultra-Resilient",
    logo: "../assets/images/SponsorLogos/gallagher-logo.jpg",
    contactInfo: [
      {
        name: "Therese O'Brien",
        email: "therese_obrien@ajg.com",
        phone: "",
      },
      {
        name: "Paul Pousson",
        email: "paul_pousson@ajg.com",
        phone: "",
      },
    ],
    website: "https://www.ajg.com/insurance/business-continuity-planning",
  },
  {
    id: "4",
    name: "TTP",
    description: " Is your organization ready for the unexpected? At Tactics, Techniques, and Procedures, LLC, (TTP, LLC) we combine decades of cross-functional expertise to fortify your business against today's threats and tomorrow's challenges. Our consultants deliver comprehensive solutions across multiple disciplines. From Business Continuity, Emergency Management, OSHA compliance, Threat and Vulnerability Assessments to Crisis Communications, Risk Management, Information, Personnel, and Industrial Security programs. Whether you're strengthening your workforce, safeguarding sensitive assets, or preparing for crises, TTP, LLC stands as your unwavering partner. We don’t just advise—we empower, protect, and prepare your organization to thrive in uncertainty.",
    level: "Ultra-Resilient",
    logo: "../assets/images/SponsorLogos/ttp-logo.png",
    contactInfo: [
      {
        name: "Chris Bygum",
        email: "cbygum@gmail.com",
        phone: "805-889-1807",
      },
    ],
    website: undefined
  },
];

export function getSponsorsByLevel(): SponsorGroup[] {
  const levels = ["Ultra-Resilient", "Resilient", "TBD"];

  return levels.map((level) => ({
    level,
    sponsors: sponsors
      .filter((sponsor) => sponsor.level === level)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

export function getAllSponsors(): Sponsor[] {
  return sponsors;
}

export function getSponsorById(id: string): Sponsor | undefined {
  return sponsors.find((sponsor) => sponsor.id === id);
}
