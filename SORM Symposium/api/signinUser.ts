import { supabase } from "@/constants/supabase";

/**
 * Sign in a user.
 * @param email The user's email.
 * @param password The user's password.
 * @returns The user object returned by Supabase.
 */
export default async function signinUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}