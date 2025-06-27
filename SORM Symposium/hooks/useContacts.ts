import { supabase } from "@/constants/supabase";
import { useCallback, useEffect, useState } from "react";

/**
 * Hook to fetch contact info from Supabase
 * @returns Object containing contacts, loading state, error, and a refresh function
 */
export type ContactInfo = {
  name: string;
  phone: string;
  email: string;
};

export function useContacts() {
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("contact_info")
        .select("*")
        .order("last_name", { ascending: true });
      if (error) throw new Error(error.message);
      const mapped = (data || []).map(row => ({
        name: `${row.first_name} ${row.last_name}`,
        phone: row.phone_number,
        email: row.email,
      }));
      setContacts(mapped);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return { contacts, loading, error, refresh: fetchContacts };
}
