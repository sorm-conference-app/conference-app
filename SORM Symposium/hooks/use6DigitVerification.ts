import { supabase } from '@/constants/supabase';

// Send an email
export async function sendVerificationEmail(to: string, resend: boolean = false): Promise<boolean> {
  const code = await generate6DigitVerificationCode();
  if (resend) {
    await supabase
      .from('verification_codes')
      .update({
        code,
        has_been_used: false,
      })
      .eq('email', to);
  } else {
    await supabase
      .from('verification_codes')
      .insert({
        email: to,
        code,
        has_been_used: false,
      });
  }

  try {
    const { data, error } = await supabase.functions.invoke('send-verification-code', {
      body: { email: to, code }
    });

    if (error) {
      throw new Error('Failed to send verification email');
    }
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }

  return true;
}

export async function generate6DigitVerificationCode() {
    let code; 
    do {
        code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (!await isValidCode(code));

    return code;
}

// Check if a code doesn't already exist in the database and was created less than 10 minutes ago
export async function isValidCode(code: string) {
    const { data, error } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('code', code)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return !data || data.created_at > new Date(Date.now() - 10 * 60 * 1000).toISOString();
}

// Check if a given code is a valid code for a given email and hasn't been used yet
export async function checkCode(email: string, code: string) {
    const { data, error } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('code', code)
        .eq('email', email)
        .eq('has_been_used', false)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (data) {
      const { data: updatedData, error: updateError } = await supabase
        .from('verification_codes')
        .update({ has_been_used: true })
        .eq('code', code)
        .eq('email', email)
        .maybeSingle();

      if (updateError) {
        throw updateError;
      }

      return true;
    }

    return false;
}