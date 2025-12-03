// Service responsible for talking to the external One Auth / Priyo Auth API.

const AUTH_API_BASE = process.env.AUTH_API_BASE;
const AUTH_API_KEY = process.env.AUTH_API_KEY;

function ensureAuthConfigured() {
  if (!AUTH_API_BASE) {
    throw new Error('AUTH_API_BASE is not configured');
  }
}

function buildAuthUrl(path) {
  ensureAuthConfigured();
  return new URL(path, AUTH_API_BASE).toString();
}

export function isAuthConfigured() {
  return Boolean(AUTH_API_BASE);
}

export async function loginWithCredentials(payload) {
  ensureAuthConfigured();

  const loginUrl = buildAuthUrl('/auth/api/v1/login/');

  const response = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(AUTH_API_KEY ? { APIKEY: AUTH_API_KEY } : {}),
    },
    body: JSON.stringify(payload || {}),
  });

  const data = await response.json().catch(() => null);

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    data.status_code = response.status;
  }

  return { status: response.status, data };
}

function normalizeToken(rawToken) {
  if (!rawToken) return '';
  const trimmed = String(rawToken).trim();
  const parts = trimmed.split(/\s+/);
  // If header looked like "Token <jwt>" or "Bearer <jwt>", return just the JWT
  if (parts.length >= 2) {
    return parts[parts.length - 1];
  }
  return trimmed;
}

function buildAuthHeaders(token) {
  const normalized = normalizeToken(token);
  return {
    // Match the Python PriyoClient behavior:
    // headers['Authorization'] = "Token <token>"
    Authorization: `Token ${normalized}`,
    ...(AUTH_API_KEY ? { APIKEY: AUTH_API_KEY } : {}),
    'Content-Type': 'application/json',
  };
}

export async function fetchUserProfile(token) {
  ensureAuthConfigured();

  const profileUrl = buildAuthUrl('/auth/api/v1/user-profile/');

  const response = await fetch(profileUrl, {
    method: 'GET',
    headers: buildAuthHeaders(token),
  });

  const profile = await response.json().catch(() => null);

  if (profile && typeof profile === 'object' && !Array.isArray(profile)) {
    profile.status_code = response.status;
  }

  if (!response.ok) {
    throw new Error('Token not valid');
  }

  return { status: response.status, data: profile };
}

export async function verifyTokenRemote(token) {
  ensureAuthConfigured();

  const verifyUrl = buildAuthUrl('/auth/api/v1/verify-token/');
  
  const response = await fetch(verifyUrl, {
    method: 'GET',
    headers: buildAuthHeaders(token),
  });
  console.log(token);
  console.log(buildAuthHeaders(token));
  console.log(response);
  const verifyData = await response.json().catch(() => null);

  if (verifyData && typeof verifyData === 'object' && !Array.isArray(verifyData)) {
    verifyData.status_code = response.status;
  }

  return { status: response.status, data: verifyData };
}

export async function logoutRemote(token) {
  ensureAuthConfigured();

  const logoutUrl = buildAuthUrl('/auth/api/v1/logout/');

  const response = await fetch(logoutUrl, {
    method: 'POST',
    headers: buildAuthHeaders(token),
    // Python client sends an empty JSON body (`{}`) with Content-Type: application/json
    body: JSON.stringify({}),
  });
  console.log(token);
  console.log({
    method: 'POST',
    headers: buildAuthHeaders(token),
    // Python client sends an empty JSON body (`{}`) with Content-Type: application/json
    body: JSON.stringify({}),
  })
  console.log(response);
  
  const data = await response.json().catch(() => null);

  return { status: response.status, data };
}


