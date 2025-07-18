import { Sponsor } from "@/types/Sponsors.types";

// Sponsor Logo Imports
import IHSLogo from "@/assets/images/SponsorLogos/IHSMainLogo.png";
import BELFORLogo from "@/assets/images/SponsorLogos/BelforPropRest.jpg";
import GallagherLogo from "@/assets/images/SponsorLogos/GallagherLogo.png";

// Function to get the sponsor logo and dimensions
export function getSponsorLogo(sponsor: Sponsor) {
  switch (sponsor.name) {
    case "Institute for Homeland Security at Sam Houston State University":
      return { logo: IHSLogo, width: 247, height: 60 };
    case "BELFOR Property Restoration":
      return { logo: BELFORLogo, width: 180, height: 60 };
    case "Gallagher":
      return { logo: GallagherLogo, width: 195, height: 80 };
    default:
      return { logo: null, width: 0, height: 0 };
  }
}