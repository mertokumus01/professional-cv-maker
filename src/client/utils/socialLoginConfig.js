/**
 * Social Login Configuration
 */

export const SOCIAL_LOGIN_CONFIG = {
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    scope: 'profile email',
    provider: 'google',
  },
  github: {
    clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
    scope: 'user:email',
    provider: 'github',
  },
};

/**
 * Validate social login config
 */
export const isSocialLoginConfigured = (provider) => {
  const config = SOCIAL_LOGIN_CONFIG[provider];
  return config && config.clientId !== '';
};

/**
 * Get OAuth redirect URI
 */
export const getOAuthRedirectUri = (provider) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/auth/oauth-callback?provider=${provider}`;
};

/**
 * Get authorization URL for provider
 */
export const getAuthorizationUrl = (provider) => {
  const config = SOCIAL_LOGIN_CONFIG[provider];
  if (!config) return null;

  const redirectUri = getOAuthRedirectUri(provider);
  const state = generateState();

  // Store state in session storage for verification
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(`oauth-state-${provider}`, state);
  }

  if (provider === 'google') {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: config.scope,
      state: state,
      access_type: 'offline',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  if (provider === 'github') {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      scope: config.scope,
      state: state,
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  return null;
};

/**
 * Generate secure random state
 */
export const generateState = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Verify OAuth state
 */
export const verifyOAuthState = (provider, state) => {
  if (typeof window === 'undefined') return false;
  
  const savedState = sessionStorage.getItem(`oauth-state-${provider}`);
  sessionStorage.removeItem(`oauth-state-${provider}`);
  
  return savedState === state;
};
