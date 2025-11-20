import validator from 'validator';
import { API_ENDPOINTS, ERROR_MESSAGES } from '../constants/api';
import { sendPasswordResetEmail, ActionCodeSettings } from "firebase/auth";
import { auth } from "../config/firebase";


interface FormData {
  name: string;
  email: string;
  password: string;
}

interface ApiResponse {
  error?: string;
  token?: string;
  exists?: boolean;
}

/**
 * Generic API call wrapper that handles fetch and error parsing
 */
async function apiCall<T = ApiResponse>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data?.error || 'API call failed');
  }
  
  return data;
}

/**
 * Validates if an email is in valid format
 */
export function validateEmail(email: string): boolean {
  return validator.isEmail(email);
}

/**
 * Checks if an email is already registered
 */
export async function checkEmailAvailability(email: string): Promise<boolean> {
  try {
    const data = await apiCall<ApiResponse>(
      `${API_ENDPOINTS.CHECK_EMAIL}?email=${encodeURIComponent(email)}`
    );
    return !data.exists; // returns true if available, false if exists
  } catch (err) {
    throw new Error(ERROR_MESSAGES.EMAIL_CHECK_ERROR);
  }
}

/**
 * Registers a new user account
 */
export async function signupUser(formData: FormData): Promise<void> {
  await apiCall(API_ENDPOINTS.SIGNUP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
}

/**
  * Sends a password recovery email to the user
  * @param email User's email address
  * @return Promise that resolves when the email is sent
**/

export async function recoverPassword(email: string) {
  const actionCodeSettings: ActionCodeSettings = {
    // redirect back to your app after reset; override with REACT_APP_APP_URL if set
    url: (process.env.REACT_APP_APP_URL || window.location.origin) + "/login",
    handleCodeInApp: false,
  };
  return sendPasswordResetEmail(auth, email, actionCodeSettings);
}

/**
 * Logs in a user and returns the authentication token
 */
export async function loginUser(
  email: string,
  password: string
): Promise<string> {
  const data = await apiCall<ApiResponse>(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!data.token) {
    throw new Error(ERROR_MESSAGES.LOGIN_ERROR);
  }
  
  return data.token;
}
