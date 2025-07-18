import { Sponsor } from "@/types/Sponsors.types";

// Sponsor Logo Imports
import IHSLogo from "@/assets/images/SponsorLogos/IHSMainLogo.png";
import BELFORLogo from "@/assets/images/SponsorLogos/BelforPropRest.jpg";
import Gallagher from "@/assets/images/SponsorLogos/gallagher-logo.jpg";
import TTP from "@/assets/images/SponsorLogos/ttp-logo.png";

// Function to get the sponsor logo and dimensions
export function getSponsorLogo(sponsor: Sponsor) {
  switch (sponsor.name) {
    case "Institute for Homeland Security at Sam Houston State University":
      return { logo: IHSLogo, width: 247, height: 60 };
    case "BELFOR Property Restoration":
      return { logo: BELFORLogo, width: 180, height: 60 };
    case "Gallagher":
      return { logo: Gallagher, width: 204, height: 76 };
    case "TTP":
      return { logo: TTP, width: 200, height: 100 };
    default:
      return { logo: null, width: 0, height: 0 };
  }
}
