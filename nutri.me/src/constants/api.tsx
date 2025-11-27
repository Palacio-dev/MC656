// API endpoints
export const API_ENDPOINTS = {
  CHECK_EMAIL: '/api/check-email',
  SIGNUP: '/api/signup',
  LOGIN: '/api/login',
} as const;

// Routes
export const ROUTES = {
  WELCOME: '/Welcome',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'E-mail inválido.',
  EMAIL_EXISTS: 'Este e-mail já está registrado.',
  EMAIL_CHECK_ERROR: 'Erro ao verificar e-mail.',
  SIGNUP_ERROR: 'Erro no cadastro',
  LOGIN_ERROR: 'Erro no login',
  UNKNOWN_ERROR: 'Erro desconhecido',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  ACCOUNT_CREATED: 'Conta criada! Faça login.',
  LOGIN_SUCCESS: 'Login OK',
} as const;
