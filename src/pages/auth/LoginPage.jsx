import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithBasicAuth } from '../../api/authApi';
import { getApiErrorMessage } from '../../utils/errors';

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginWithBasicAuth(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo iniciar sesion'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-header">
          <h1>CafeAdmin</h1>
          <p>Controla operaciones, inventario y ventas en un solo panel.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Usuario
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="admin"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Contrasena
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <p className="feedback error">{error}</p> : null}

          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Entrar al sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
