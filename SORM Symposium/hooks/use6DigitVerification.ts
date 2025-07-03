import { supabase } from '@/constants/supabase';

// Send an email
export async function sendVerificationEmail(to: string, resend: boolean = false): Promise<boolean> {
  const code = await generate6DigitVerificationCode();

  if (!resend) {
    const { data: existingCode, error: existingCodeError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', to)
      .maybeSingle();

    if (existingCode) {
      resend = true;
    }
  }

  if (resend) {
    const { data: updateData, error: updateError } = await supabase
      .from('verification_codes')
      .update({
        created_at: new Date().toISOString(),
        code,
        has_been_used: false,
      })
      .eq('email', to)
      .select();

    if (updateError) {
      throw updateError;
    }
  } else {
    const { data: insertData, error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        created_at: new Date().toISOString(),
        email: to,
        code,
        has_been_used: false,
      })
      .select();

    if (insertError) {
      throw insertError;
    }
  }

  try {
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-verification-email', {
      body: { email: to, code }
    });

    if (emailError) {
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

    if (data && data.created_at > new Date(Date.now() - 10 * 60 * 1000).toISOString()) {
      const { data: updatedData, error: updateError } = await supabase
        .from('verification_codes')
        .update({ has_been_used: true })
        .eq('code', code)
        .eq('email', email)
        .select()
        .maybeSingle();

      if (updateError) {
        throw updateError;
      }

      return true;
    }

    return false;
}