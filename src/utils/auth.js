const AUTH_TOKEN_KEY = 'crm_token';
const AUTH_USER_KEY = 'crm_user';
const AUTH_SIGNUP_USERS_KEY = 'crm_signup_users';

const getClientStorages = () => {
  if (typeof window === 'undefined') return [];
  return [localStorage, sessionStorage];
};

const readFromStorages = (key) => {
  const storages = getClientStorages();
  for (const storage of storages) {
    const value = storage.getItem(key);
    if (value) return { value, storage };
  }
  return null;
};

export function clearStoredAuth() {
  const storages = getClientStorages();
  storages.forEach(storage => {
    storage.removeItem(AUTH_TOKEN_KEY);
    storage.removeItem(AUTH_USER_KEY);
  });
}

export function getStoredAuthUser() {
  const tokenEntry = readFromStorages(AUTH_TOKEN_KEY);
  if (!tokenEntry) return null;
  if (isTokenExpired(tokenEntry.value)) {
    clearStoredAuth();
    return null;
  }

  const userEntry = readFromStorages(AUTH_USER_KEY);
  if (!userEntry) {
    clearStoredAuth();
    return null;
  }

  try {
    return JSON.parse(userEntry.value);
  } catch (err) {
    console.warn('Failed to parse stored user:', err);
    clearStoredAuth();
    return null;
  }
}

export function getSignupUsers() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AUTH_SIGNUP_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to parse signup users:', err);
    return [];
  }
}

export function saveSignupUsers(users) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_SIGNUP_USERS_KEY, JSON.stringify(users));
}

export function registerSignupUser(payload) {
  const currentUsers = getSignupUsers();
  const normalizedEmail = (payload?.email || '').trim().toLowerCase();
  const emailExists = currentUsers.some((u) => (u?.email || '').toLowerCase() === normalizedEmail);

  if (emailExists) {
    return { ok: false, error: 'Account with this email already exists.' };
  }

  const name = (payload?.name || '').trim();
  const avatar = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'US';

  const role = payload?.role || 'user';
  const nextUser = {
    id: Date.now(),
    name,
    email: normalizedEmail,
    password: payload?.password || '',
    role,
    teamId: role === 'manager' || role === 'user' ? 'team_01' : null,
    avatar,
  };

  saveSignupUsers([...currentUsers, nextUser]);
  return { ok: true, user: nextUser };
}

export function decodeToken(token) {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  return decoded.exp < Math.floor(Date.now() / 1000);
}
