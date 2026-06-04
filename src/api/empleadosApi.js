import { apiClient } from './client';

export async function getEmpleados() {
  const { data } = await apiClient.get('/empleados/empleados/');
  return data;
}

export async function createEmpleado(payload) {
  const { data } = await apiClient.post('/empleados/empleados/', payload);
  return data;
}

export async function updateEmpleado(id, payload) {
  const { data } = await apiClient.put(`/empleados/empleados/${id}/`, payload);
  return data;
}

export async function deleteEmpleado(id) {
  await apiClient.delete(`/empleados/empleados/${id}/`);
}

export async function getEmpleadosLookups() {
  const [estados, nacionalidades, turnos, contratos] = await Promise.all([
    apiClient.get('/empleados/estados-civiles/'),
    apiClient.get('/empleados/nacionalidades/'),
    apiClient.get('/empleados/turnos/'),
    apiClient.get('/empleados/tipos-contrato/'),
  ]);

  return {
    estadosCiviles: estados.data,
    nacionalidades: nacionalidades.data,
    turnos: turnos.data,
    tiposContrato: contratos.data,
  };
}

export async function getSalarios() {
  const { data } = await apiClient.get('/empleados/salarios/');
  return data;
}

export async function createSalario(payload) {
  const { data } = await apiClient.post('/empleados/salarios/', payload);
  return data;
}

export async function updateSalario(id, payload) {
  const { data } = await apiClient.put(`/empleados/salarios/${id}/`, payload);
  return data;
}

export async function deleteSalario(id) {
  await apiClient.delete(`/empleados/salarios/${id}/`);
}
