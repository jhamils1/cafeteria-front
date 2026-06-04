import { apiClient } from './client';

export async function getCategorias() {
  const { data } = await apiClient.get('/productos/categorias/');
  return data;
}

export async function createCategoria(payload) {
  const { data } = await apiClient.post('/productos/categorias/', payload);
  return data;
}

export async function updateCategoria(id, payload) {
  const { data } = await apiClient.put(`/productos/categorias/${id}/`, payload);
  return data;
}

export async function deleteCategoria(id) {
  await apiClient.delete(`/productos/categorias/${id}/`);
}

export async function getProductos() {
  const { data } = await apiClient.get('/productos/productos/');
  return data;
}

export async function createProducto(payload) {
  const { data } = await apiClient.post('/productos/productos/', payload);
  return data;
}

export async function updateProducto(id, payload) {
  const { data } = await apiClient.put(`/productos/productos/${id}/`, payload);
  return data;
}

export async function deleteProducto(id) {
  await apiClient.delete(`/productos/productos/${id}/`);
}
