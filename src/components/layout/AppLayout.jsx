import { Outlet, useNavigate } from 'react-router-dom';
import { getAuthUser, logout } from '../../api/authApi';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

function AppLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Topbar username={getAuthUser()} onLogout={handleLogout} />
        <section className="content-area">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default AppLayout;
