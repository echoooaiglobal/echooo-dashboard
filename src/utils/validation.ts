// src/utils/validation.ts

export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true, message: '' };
};

export const validateEmail = (email: string): { valid: boolean; message: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  
  return { valid: true, message: '' };
};

export const validatePhoneNumber = (phone: string): { valid: boolean; message: string } => {
  // Skip validation if phone is empty (since it's optional)
  if (!phone) return { valid: true, message: '' };
  
  // Basic international phone number validation
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: 'Please enter a valid international phone number (e.g., +1234567890)' };
  }
  
  return { valid: true, message: '' };
};