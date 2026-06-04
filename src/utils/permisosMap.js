/**
 * Mapeo de códigos técnicos de permisos Django a descripción en español
 * Los permisos con valor null serán filtrados (no mostrados al usuario)
 */
export const permisosMap = {
  // Clientes
  add_cliente: 'Agregar cliente',
  change_cliente: 'Editar cliente',
  delete_cliente: 'Eliminar cliente',
  view_cliente: 'Ver clientes',

  // Ventas
  add_notaventa: 'Agregar nota de venta',
  change_notaventa: 'Editar nota de venta',
  delete_notaventa: 'Eliminar nota de venta',
  view_notaventa: 'Ver notas de venta',
  add_detalleventa: 'Agregar detalle de venta',
  change_detalleventa: 'Editar detalle de venta',
  delete_detalleventa: 'Eliminar detalle de venta',
  view_detalleventa: 'Ver detalles de venta',

  // Productos
  add_producto: 'Agregar producto',
  change_producto: 'Editar producto',
  delete_producto: 'Eliminar producto',
  view_producto: 'Ver productos',
  add_categoriaproducto: 'Agregar categoría',
  change_categoriaproducto: 'Editar categoría',
  delete_categoriaproducto: 'Eliminar categoría',
  view_categoriaproducto: 'Ver categorías',

  // Empleados
  add_empleado: 'Agregar empleado',
  change_empleado: 'Editar empleado',
  delete_empleado: 'Eliminar empleado',
  view_empleado: 'Ver empleados',

  // Salarios
  add_salario: 'Agregar salario',
  change_salario: 'Editar salario',
  delete_salario: 'Eliminar salario',
  view_salario: 'Ver salarios',

  // Usuarios
  add_user: 'Agregar usuario',
  change_user: 'Editar usuario',
  delete_user: 'Eliminar usuario',
  view_user: 'Ver usuarios',

  // Bitácora
  add_bitacora: 'Agregar bitácora',
  view_bitacora: 'Ver bitácora',

  // Internos de Django
  add_logentry: 'Agregar entrada de log',
  change_logentry: 'Editar entrada de log',
  delete_logentry: 'Eliminar entrada de log',
  view_logentry: 'Ver entradas de log',
  add_group: 'Agregar grupo',
  change_group: 'Editar grupo',
  delete_group: 'Eliminar grupo',
  view_group: 'Ver grupos',
  add_permission: 'Agregar permiso',
  change_permission: 'Editar permiso',
  delete_permission: 'Eliminar permiso',
  view_permission: 'Ver permisos',
  add_contenttype: 'Agregar tipo de contenido',
  change_contenttype: 'Editar tipo de contenido',
  delete_contenttype: 'Eliminar tipo de contenido',
  view_contenttype: 'Ver tipos de contenido',
  add_session: 'Agregar sesión',
  change_session: 'Editar sesión',
  delete_session: 'Eliminar sesión',
  view_session: 'Ver sesiones',
};

/**
 * Convierte un código de permiso a su descripción en español
 * @param {string} codigoPermiso - Código técnico del permiso (ej: "add_cliente")
 * @returns {string|null} Descripción en español o null si debe ocultarse
 */
export function getPermisoBlueprintNames(codigoPermiso) {
  return permisosMap[codigoPermiso] || codigoPermiso;
}
