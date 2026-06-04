import { apiClient } from './client';

export async function getUsuarios() {
  const { data } = await apiClient.get('/usuarios/users/');
  return data;
}

export async function createUsuario(payload) {
  const { data } = await apiClient.post('/usuarios/users/', payload);
  return data;
}

export async function updateUsuario(id, payload) {
  const { data } = await apiClient.put(`/usuarios/users/${id}/`, payload);
  return data;
}

export async function deleteUsuario(id) {
  await apiClient.delete(`/usuarios/users/${id}/`);
}

export async function getBitacoras() {
  const { data } = await apiClient.get('/usuarios/bitacoras/');
  return data;
}

export async function getRoles() {
  const { data } = await apiClient.get('/usuarios/groupsAux/');
  return data;
}

export async function createRole(payload) {
  const { data } = await apiClient.post('/usuarios/groupsAux/', payload);
  return data;
}

export async function updateRole(id, payload) {
  const { data } = await apiClient.put(`/usuarios/groupsAux/${id}/`, payload);
  return data;
}

export async function deleteRole(id) {
  await apiClient.delete(`/usuarios/groupsAux/${id}/`);
}

export async function getPermissions() {
  const { data } = await apiClient.get('/usuarios/permissions/');
  return data;
}
