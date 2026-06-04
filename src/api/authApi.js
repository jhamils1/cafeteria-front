import { apiClient, clearAuth, getStoredAuth, saveAuth } from './client';

export async function getCurrentUserProfile() {
  const { data } = await apiClient.get('/usuarios/users/me/');
  return data;
}

export async function loginWithBasicAuth({ username, password }) {
  const encoded = window.btoa(`${username}:${password}`);

  const response = await apiClient.get('/empleados/turnos/', {
    headers: {
      Authorization: `Basic ${encoded}`,
    },
  });

  if (response.status >= 200 && response.status < 300) {
    saveAuth({ username, password });
    const profile = await getCurrentUserProfile();
    saveAuth({ username, password, profile });
    return profile;
  }

  throw new Error('Credenciales invalidas');
}

export function logout() {
  clearAuth();
}

export function isAuthenticated() {
  return Boolean(getStoredAuth());
}

export function getAuthUser() {
  const auth = getStoredAuth();
  return auth?.profile?.username ?? auth?.username ?? 'Invitado';
}

export function getAuthProfile() {
  const auth = getStoredAuth();
  return auth?.profile ?? null;
}

export function getAuthPermissions() {
  return getAuthProfile()?.permissions ?? [];
}

export function getAuthRoles() {
  return getAuthProfile()?.roles ?? [];
}

function normalizePermissionCode(permissionCode) {
  if (!permissionCode) {
    return '';
  }

  return permissionCode.includes('.') ? permissionCode.split('.').pop() : permissionCode;
}

export function hasAuthPermission(permissionCode) {
  const profile = getAuthProfile();
  if (!profile) {
    return false;
  }

  if (profile.is_staff) {
    return true;
  }

  const normalizedRequested = normalizePermissionCode(permissionCode);

  return (profile.permissions || []).some((storedPermission) => {
    const normalizedStored = normalizePermissionCode(storedPermission);
    return storedPermission === permissionCode || normalizedStored === normalizedRequested;
  });
}

export function hasAnyAuthPermission(permissionCodes = []) {
  if (!permissionCodes.length) {
    return true;
  }

  return permissionCodes.some((permissionCode) => hasAuthPermission(permissionCode));
}

export function hasAuthRole(roleName) {
  const profile = getAuthProfile();
  if (!profile) {
    return false;
  }

  return (profile.roles || []).some((role) => role.name === roleName);
}

export function hasStaffAccess() {
  return Boolean(getAuthProfile()?.is_staff);
}
