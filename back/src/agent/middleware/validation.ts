export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateMessage(message: unknown): ValidationResult {
  // Vérifier que le message existe
  if (message === null || message === undefined) {
    return {
      isValid: false,
      error: 'Message is required'
    };
  }

  // Vérifier que c'est une chaîne
  if (typeof message !== 'string') {
    return {
      isValid: false,
      error: 'Message must be a string'
    };
  }

  // Vérifier que ce n'est pas vide
  if (message.trim().length === 0) {
    return {
      isValid: false,
      error: 'Message cannot be empty'
    };
  }

  // Vérifier la longueur maximale
  if (message.length > 10000) {
    return {
      isValid: false,
      error: 'Message too long (max 10000 characters)'
    };
  }

  // Vérifier les caractères interdits (protection XSS basique)
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(message)) {
      return {
        isValid: false,
        error: 'Message contains potentially dangerous content'
      };
    }
  }

  return {
    isValid: true
  };
}
