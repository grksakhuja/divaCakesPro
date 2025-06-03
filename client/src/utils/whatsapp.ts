// WhatsApp utility functions
// This file provides utilities for generating WhatsApp links and messages

export interface WhatsAppLinkOptions {
  phoneNumber: string;
  message?: string;
}

/**
 * Generates a WhatsApp link with a phone number and optional message
 * @param options - Configuration for the WhatsApp link
 * @returns WhatsApp URL that opens with pre-filled message
 */
export function generateWhatsAppLink({ phoneNumber, message }: WhatsAppLinkOptions): string {
  // Clean phone number (remove spaces, dashes, parentheses, plus signs for processing)
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Ensure the number starts with country code (if it doesn't have +, assume it needs one)
  const formattedNumber = cleanNumber.startsWith('+') ? cleanNumber.slice(1) : cleanNumber;
  
  // Default message for cake inquiries
  const defaultMessage = "Hi! I'm interested in ordering a custom cake. Can you help me?";
  const textMessage = message || defaultMessage;
  
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(textMessage);
  
  return `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
}

/**
 * Validates if a phone number is in a valid format for WhatsApp
 * @param phoneNumber - Phone number to validate
 * @returns boolean indicating if the number is valid
 */
export function isValidWhatsAppNumber(phoneNumber: string): boolean {
  if (!phoneNumber) return false;
  
  // Clean the number
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Check if it's a valid international format (with or without +)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(cleanNumber);
}

/**
 * Formats a phone number for display
 * @param phoneNumber - Raw phone number
 * @returns Formatted phone number string
 */
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Add + if it doesn't exist
  if (!phoneNumber.startsWith('+')) {
    return `+${phoneNumber}`;
  }
  
  return phoneNumber;
}

// Pre-defined messages for different scenarios
export const WhatsAppMessages = {
  GENERAL_INQUIRY: "Hi! I'm interested in ordering a custom cake. Can you help me?",
  WEDDING_CAKE: "Hi! I'm looking for a custom wedding cake. Could you please share more details about your services?",
  BIRTHDAY_CAKE: "Hello! I'd like to order a custom birthday cake. Can we discuss the options?",
  URGENT_ORDER: "Hi! I need a custom cake on short notice. Are you able to help with urgent orders?",
  PRICE_INQUIRY: "Hello! Could you please share your pricing for custom cakes?",
} as const;