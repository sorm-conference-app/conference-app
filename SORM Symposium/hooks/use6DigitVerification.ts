import { supabase } from '@/constants/supabase';
import nodemailer from 'nodemailer';

// Create a transporter using your Gmail and app password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sorm.symposium@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Send an email
export async function sendVerificationEmail(to: string, resend: boolean = false) {
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

  await transporter.sendMail({
    from: '"SORM Symposium" <sorm.symposium@gmail.com>',
    to,
    subject: 'SORM Symposium Email Verification Code',
    text: `Your one-time verification code is: ${code}`,
    html: `<p>Your one-time verification code is: <b>${code}</b></p>`,
  });
}

export async function generate6DigitVerificationCode() {
    let code; 
    do {
        code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (await isValidCode(code));

    return code;
}

// Check if a code doesn't already exist in the database and was created less than 10 minutes ago
export async function isValidCode(code: string) {
    const { data, error } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('code', code)
        .single();

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
        .single();

    if (error) {
        throw error;
    }

    if (data) {
      const { data: updatedData, error: updateError } = await supabase
        .from('verification_codes')
        .update({ has_been_used: true })
        .eq('code', code)
        .eq('email', email)
        .single();

      if (updateError) {
        throw updateError;
      }

      return true;
    }

    return false;
}