import { supabase } from "@/constants/supabase";
import { useQuery } from "@tanstack/react-query";
import useCacheDatabase from "../useCacheDatabase";
import { contact_info } from "@/db/schema";
import { sql } from "drizzle-orm";

/**
 * This is the hook that will be used in native platforms.
 */

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
  const cache = useCacheDatabase();

  return useQuery<ContactInfo[]>({
    queryKey: ["contacts"],
    queryFn: async function () {
      const { data = [], error } = await supabase
        .from("contact_info")
        .select("*")
        .order("last_name", { ascending: true });

      if (error) {
        throw error;
      }
      // If successfully fetched data, insert it into the cache.
      const insertData = data!.map((row) => ({
        ...row,
        created_at: new Date(row.created_at), // Supabase returns created_at as a string; to store in SQLite, convert it to a Date object
      }));

      // Populate the cache with the fetched data
      await cache
        .insert(contact_info)
        .values(insertData)
        .onConflictDoUpdate({
          target: contact_info.id,
          set: {
            first_name: sql.raw(`excluded.${contact_info.first_name.name}`),
            last_name: sql.raw(`excluded.${contact_info.last_name.name}`),
            phone_number: sql.raw(`excluded.${contact_info.phone_number.name}`),
          },
        });
      return data!.map<ContactInfo>((row) => ({
        name: `${row.first_name} ${row.last_name}`,
        phone: row.phone_number,
        email: row.email,
      }));
    },
  });
}
