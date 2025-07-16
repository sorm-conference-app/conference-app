import { useQuery } from "@tanstack/react-query";

export type ContactInfo = {
  name: string;
  phone: string;
  email: string;
};

export default function useContacts(): ReturnType<typeof useQuery<ContactInfo[]>> {
  throw new Error("Should not be called directly.");
} 