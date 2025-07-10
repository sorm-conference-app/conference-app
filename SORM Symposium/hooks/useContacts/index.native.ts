import { supabase } from "@/constants/supabase";
import { useQuery } from "@tanstack/react-query";
import useCacheDatabase from "../useCacheDatabase";
import { contact_info } from "@/db/schema";
import { sql } from "drizzle-orm";

// Set to true to test cache-only mode (no network requests)
const CACHE_ONLY = true;

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
      // Cache-only mode for testing
      if (CACHE_ONLY) {
        console.log("🔄 Using cache-only mode for contacts");
        try {
          const cachedContacts = await cache.select().from(contact_info);
          console.log(`Retrieved ${cachedContacts.length} contacts from cache`);
          
          // Convert cached data to ContactInfo type
          return cachedContacts.map(contact => ({
            name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
            phone: contact.phone_number || '',
            email: contact.email || '',
          }));
        } catch (cacheError) {
          console.warn("Failed to read contacts from cache:", cacheError);
          return [];
        }
      }

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
        first_name: row.first_name || '', // Handle null values
        last_name: row.last_name || '', // Handle null values
        phone_number: row.phone_number || '', // Handle null values
        email: row.email || '', // Handle null values
        created_at: new Date(row.created_at), // Supabase returns created_at as a string; to store in SQLite, convert it to a Date object
      }));

      // Populate the cache with the fetched data
      try {
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
      } catch (cacheError) {
        console.warn("Failed to cache contacts:", cacheError);
        // Continue without caching - the data is still returned from Supabase
      }
      
      return data!.map<ContactInfo>((row) => ({
        name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
        phone: row.phone_number || '',
        email: row.email || '',
      }));
    },
  });
}
