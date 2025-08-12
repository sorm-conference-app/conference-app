/**
 * Password validation utilities for admin password requirements
 */

export interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

export interface PasswordStrengthResult {
  score: number; // 0-4 scale
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  requirements: PasswordRequirement[];
  isValid: boolean;
}

/**
 * Password complexity requirements for admin accounts
 */
export const PASSWORD_REQUIREMENTS = [
  {
    id: 'length',
    label: 'At least 10 characters',
    test: (password: string) => password.length >= 10,
    met: false,
  },
  {
    id: 'uppercase',
    label: 'At least 1 uppercase letter',
    test: (password: string) => /[A-Z]/.test(password),
    met: false,
  },
  {
    id: 'lowercase',
    label: 'At least 1 lowercase letter',
    test: (password: string) => /[a-z]/.test(password),
    met: false,
  },
  {
    id: 'number',
    label: 'At least 1 number',
    test: (password: string) => /[0-9]/.test(password),
    met: false,
  },
  {
    id: 'special',
    label: 'At least 1 special character (!@#$%^&*()_+-=[]{}|;:,.<>?)',
    test: (password: string) => /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password),
    met: false,
  },
];

/**
 * Evaluate password strength and requirement compliance
 * @param password - The password to evaluate
 * @returns PasswordStrengthResult with score, label, and requirement details
 */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const requirements = PASSWORD_REQUIREMENTS.map(req => ({
    ...req,
    met: req.test(password),
  }));

  const metRequirements = requirements.filter(req => req.met).length;
  const score = metRequirements;
  
  let label: PasswordStrengthResult['label'];
  switch (score) {
    case 0:
    case 1:
      label = 'Very Weak';
      break;
    case 2:
      label = 'Weak';
      break;
    case 3:
      label = 'Fair';
      break;
    case 4:
      label = 'Good';
      break;
    case 5:
      label = 'Strong';
      break;
    default:
      label = 'Very Weak';
  }

  const isValid = metRequirements === PASSWORD_REQUIREMENTS.length;

  return {
    score,
    label,
    requirements,
    isValid,
  };
}

/**
 * Validate that passwords match
 * @param password - The new password
 * @param confirmPassword - The confirmation password
 * @returns True if passwords match and are not empty
 */
export function validatePasswordsMatch(password: string, confirmPassword: string): boolean {
  return password.length > 0 && password === confirmPassword;
}

/**
 * Validate that new password is different from current password
 * @param currentPassword - The current password
 * @param newPassword - The new password
 * @returns True if passwords are different
 */
export function validatePasswordDifferent(currentPassword: string, newPassword: string): boolean {
  return currentPassword !== newPassword && newPassword.length > 0;
}

/**
 * Get color for password strength indicator
 * @param score - Password strength score (0-5)
 * @returns Color string for UI display
 */
export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return '#ef4444'; // red-500
    case 2:
      return '#f97316'; // orange-500
    case 3:
      return '#eab308'; // yellow-500
    case 4:
      return '#22c55e'; // green-500
    case 5:
      return '#16a34a'; // green-600
    default:
      return '#ef4444';
  }
}
