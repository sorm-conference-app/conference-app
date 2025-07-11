import { supabase } from "@/constants/supabase";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch contact info from Supabase
 * @returns Object containing contacts, loading state, error, and a refresh function
 */
type ContactInfo = {
  name: string;
  phone: string;
  email: string;
};

export default function useContacts() {
  return useQuery<ContactInfo[]>({
    queryKey: ["contacts"],
    queryFn: async function () {
      const { data = [], error } = await supabase
        .from("contact_info")
        .select("*")
        .order("last_name", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data!.map<ContactInfo>((row) => ({
        name: `${row.first_name} ${row.last_name}`,
        phone: row.phone_number,
        email: row.email,
      }));
    },
  });
}
