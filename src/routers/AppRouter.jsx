import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { hasAnyAuthPermission, hasStaffAccess, isAuthenticated } from '../api/authApi';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import EmpleadosPage from '../pages/empleados/EmpleadosPage';
import SalariosPage from '../pages/empleados/SalariosPage';
import NotFoundPage from '../pages/NotFoundPage';
import CategoriasPage from '../pages/productos/CategoriasPage';
import ProductosPage from '../pages/productos/ProductosPage';
import BitacoraPage from '../pages/usuarios/BitacoraPage';
import RolesPage from '../pages/usuarios/RolesPage';
import UsuariosPage from '../pages/usuarios/UsuariosPage';
import ClientesPage from '../pages/ventas/ClientesPage';
import NotasVentaPage from '../pages/ventas/NotasVentaPage';
import ReporteVentas from '../pages/ventas/ReporteVentas';

function PrivateRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function PermissionRoute({ children, permissions = [] }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAnyAuthPermission(permissions)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function StaffRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!hasStaffAccess()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route
            path="usuarios"
            element={
              <PermissionRoute permissions={['view_user']}>
                <UsuariosPage />
              </PermissionRoute>
            }
          />
          <Route
            path="usuarios/roles"
            element={
              <PermissionRoute permissions={['view_group']}>
                <RolesPage />
              </PermissionRoute>
            }
          />
          <Route
            path="usuarios/bitacora"
            element={
              <PermissionRoute permissions={['view_bitacora']}>
                <BitacoraPage />
              </PermissionRoute>
            }
          />
          <Route
            path="empleados"
            element={
              <PermissionRoute permissions={['view_empleado']}>
                <EmpleadosPage />
              </PermissionRoute>
            }
          />
          <Route
            path="empleados/salarios"
            element={
              <PermissionRoute permissions={['view_salario']}>
                <SalariosPage />
              </PermissionRoute>
            }
          />
          <Route
            path="productos/categorias"
            element={
              <PermissionRoute permissions={['view_categoriaproducto']}>
                <CategoriasPage />
              </PermissionRoute>
            }
          />
          <Route
            path="productos"
            element={
              <PermissionRoute permissions={['view_producto']}>
                <ProductosPage />
              </PermissionRoute>
            }
          />
          <Route
            path="ventas/clientes"
            element={
              <PermissionRoute permissions={['view_cliente']}>
                <ClientesPage />
              </PermissionRoute>
            }
          />
          <Route
            path="ventas/notas"
            element={
              <PermissionRoute permissions={['add_notaventa', 'view_notaventa']}>
                <NotasVentaPage />
              </PermissionRoute>
            }
          />
          <Route
            path="ventas/reporte"
            element={
              <StaffRoute>
                <ReporteVentas />
              </StaffRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
