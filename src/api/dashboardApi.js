import { getEmpleados } from './empleadosApi';
import { getProductos } from './productosApi';
import { getUsuarios } from './usuariosApi';
import { getClientes, getNotasVenta } from './ventasApi';
import { getAuthProfile, hasAnyAuthPermission } from './authApi';

export async function getDashboardSummary() {
  const profile = getAuthProfile();
  const isStaff = Boolean(profile?.is_staff);

  const summary = {
    availableCards: [],
  };

  const tasks = [];

  if (isStaff || hasAnyAuthPermission(['view_user'])) {
    summary.availableCards.push('usuarios');
    tasks.push(getUsuarios().then((data) => ({ key: 'usuarios', value: data.length })));
  }

  if (isStaff || hasAnyAuthPermission(['view_empleado'])) {
    summary.availableCards.push('empleados');
    tasks.push(getEmpleados().then((data) => ({ key: 'empleados', value: data.length })));
  }

  if (isStaff || hasAnyAuthPermission(['view_producto'])) {
    summary.availableCards.push('productos', 'productosActivos', 'stockBajo');
    tasks.push(
      getProductos().then((data) => ({
        key: 'productosData',
        value: data,
      })),
    );
  }

  if (isStaff || hasAnyAuthPermission(['view_cliente'])) {
    summary.availableCards.push('clientes');
    tasks.push(getClientes().then((data) => ({ key: 'clientes', value: data.length })));
  }

  if (isStaff || hasAnyAuthPermission(['add_notaventa', 'view_notaventa'])) {
    summary.availableCards.push('notasVenta', 'totalVentas');
    tasks.push(getNotasVenta().then((data) => ({ key: 'notasData', value: data })));
  }

  const results = await Promise.all(tasks);
  let productos = [];
  let notas = [];

  for (const result of results) {
    if (result.key === 'usuarios' || result.key === 'empleados' || result.key === 'clientes') {
      summary[result.key] = result.value;
    }

    if (result.key === 'productosData') {
      productos = result.value;
      summary.productos = productos.length;
      summary.productosActivos = productos.filter((item) => item.estado).length;
      summary.stockBajo = productos.filter((item) => Number(item.stock) <= 5).length;
    }

    if (result.key === 'notasData') {
      notas = result.value;
      summary.notasVenta = notas.length;
      summary.totalVentas = notas.reduce((acc, nota) => acc + Number(nota.total || 0), 0);
    }
  }

  return summary;
}
