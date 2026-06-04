import { apiClient } from './client';

export async function getClientes() {
  const { data } = await apiClient.get('/ventas/clientes/');
  return data;
}

export async function createCliente(payload) {
  const { data } = await apiClient.post('/ventas/clientes/', payload);
  return data;
}

export async function updateCliente(id, payload) {
  const { data } = await apiClient.put(`/ventas/clientes/${id}/`, payload);
  return data;
}

export async function deleteCliente(id) {
  await apiClient.delete(`/ventas/clientes/${id}/`);
}

export async function getNotasVenta() {
  const { data } = await apiClient.get('/ventas/notas-venta/');
  return data;
}

export async function createNotaVenta(payload) {
  const { data } = await apiClient.post('/ventas/notas-venta/', payload);
  return data;
}

export async function updateNotaVenta(id, payload) {
  const { data } = await apiClient.put(`/ventas/notas-venta/${id}/`, payload);
  return data;
}

export async function deleteNotaVenta(id) {
  await apiClient.delete(`/ventas/notas-venta/${id}/`);
}

export async function getDetallesVenta() {
  const { data } = await apiClient.get('/ventas/detalles-venta/');
  return data;
}

export async function getReporteVentas(fechaInicio = null, fechaFin = null) {
  let url = '/ventas/reporte/';
  const params = new URLSearchParams();
  
  if (fechaInicio) {
    params.append('fecha_inicio', fechaInicio);
  }
  if (fechaFin) {
    params.append('fecha_fin', fechaFin);
  }
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const { data } = await apiClient.get(url);
  return data;
}
