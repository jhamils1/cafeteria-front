import { NavLink } from 'react-router-dom';
import {
  FaChevronDown,
  FaQuestionCircle,
  FaClipboardList,
  FaCoffee,
  FaCrown,
  FaUsers,
  FaUserTie,
  FaBoxOpen,
  FaCashRegister,
  FaChartBar,
  FaFileInvoice,
  FaUserShield,
} from 'react-icons/fa';
import { getAuthProfile, hasAnyAuthPermission, hasStaffAccess } from '../../api/authApi';

const menuSections = [
  {
    title: 'Administrador',
    items: [
      { label: 'Usuarios', to: '/usuarios', icon: FaUsers, permissions: ['view_user'] },
      { label: 'Roles', to: '/usuarios/roles', icon: FaUserShield, permissions: ['view_group'] },
      { label: 'Bitacora', to: '/usuarios/bitacora', icon: FaClipboardList, permissions: ['view_bitacora'] },
    ],
  },
  {
    title: 'Personal',
    items: [
      { label: 'Empleados', to: '/empleados', icon: FaUserTie, permissions: ['view_empleado'] },
      { label: 'Salarios', to: '/empleados/salarios', icon: FaCashRegister, permissions: ['view_salario'] },
    ],
  },
  {
    title: 'Inventario',
    items: [
      { label: 'Productos', to: '/productos', icon: FaBoxOpen, permissions: ['view_producto'] },
      { label: 'Categoria', to: '/productos/categorias', icon: FaCrown, permissions: ['view_categoriaproducto'] },
    ],
  },
  {
    title: 'Clientes',
    items: [{ label: 'Clientes', to: '/ventas/clientes', icon: FaUsers, permissions: ['view_cliente'] }],
  },
  {
    title: 'Ventas',
    items: [
      { label: 'Nota de Venta', to: '/ventas/notas', icon: FaFileInvoice, permissions: ['add_notaventa', 'view_notaventa'] },
      { label: 'Reporte de ventas', to: '/ventas/reporte', icon: FaChartBar, staffOnly: true },
    ],
  },
];

function Sidebar() {
  const profile = getAuthProfile();
  const isStaff = Boolean(profile?.is_staff);

  const visibleSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.staffOnly) {
          return hasStaffAccess();
        }

        return isStaff || hasAnyAuthPermission(item.permissions || []);
      }),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className="sidebar">
      <div className="brand">
        <h1><FaCoffee /> CafeAdmin</h1>
        <p>Gestion integral de cafeteria</p>
      </div>

      <div className="nav-menu">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item nav-dashboard ${isActive ? 'active' : ''}`}
        >
          <FaCoffee />
          <span>Dashboard</span>
        </NavLink>

        {visibleSections.map((section) => (
          <div key={section.title} className="nav-section">
            <div className="nav-section-title">
              <span>{section.title}</span>
            
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      <button type="button" className="sidebar-help">
        <FaQuestionCircle />
        Ayuda
      </button>
    </aside>
  );
}

export default Sidebar;
