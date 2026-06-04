import { useEffect, useState } from 'react';
import './UsuariosPage.css';
import { createUsuario, deleteUsuario, getRoles, getUsuarios, updateUsuario } from '../../api/usuariosApi';
import StatusMessage from '../../components/ui/StatusMessage';
import { getApiErrorMessage } from '../../utils/errors';

const initialForm = {
  username: '',
  first_name: '',
  last_name: '',
  email: '',
  role_id: '',
  activo: true,
  password: '',
  password_confirm: '',
};

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadUsuarios();
  }, []);

  async function loadUsuarios() {
    setLoading(true);
    setError('');
    try {
      const [usersData, rolesData] = await Promise.all([getUsuarios(), getRoles()]);
      setUsuarios(usersData);
      setRoles(rolesData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo cargar usuarios'));
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleEdit(user) {
    setSelectedId(user.id);
    setForm({
      username: user.username || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      role_id: String(user.groups?.[0]?.id || ''),
      activo: user.activo !== undefined ? Boolean(user.activo) : true,
      password: '',
      password_confirm: '',
    });
  }

  function resetForm() {
    setSelectedId(null);
    setForm(initialForm);
  }

  function handleCloseModal() {
    resetForm();
    setShowModal(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        username: form.username,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        group_ids: form.role_id ? [Number(form.role_id)] : [],
        activo_write: form.activo,
      };
      if (selectedId) {
        if (form.password) {
          payload.password = form.password;
          payload.password_confirm = form.password_confirm;
        }
        await updateUsuario(selectedId, payload);
      } else {
        payload.password = form.password;
        payload.password_confirm = form.password_confirm;
        await createUsuario(payload);
      }
      handleCloseModal();
      await loadUsuarios();
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo guardar el usuario'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('¿Deseas eliminar este usuario?');
    if (!confirmed) return;
    try {
      await deleteUsuario(id);
      await loadUsuarios();
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo eliminar el usuario'));
    }
  }

  return (
    <div className="page-container">
      <div className="list-header">
        <h2>Usuarios</h2>
        <button className="button-new" onClick={() => setShowModal(true)}>
          ＋ Nuevo Usuario
        </button>
      </div>
      <StatusMessage loading={loading} error={error} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.username}</td>
                <td>{`${item.first_name || ''} ${item.last_name || ''}`.trim() || '-'}</td>
                <td>{item.email || '-'}</td>
                <td>{item.groups?.[0]?.name || '-'}</td>
                <td>{item.activo !== undefined ? (item.activo ? 'Activo' : 'Inactivo') : '-'}</td>
                <td className="row-actions">
                  <button
                    className="button-secondary"
                    onClick={() => {
                      handleEdit(item);
                      setShowModal(true);
                    }}
                  >
                    Editar
                  </button>
                  <button className="button-danger" onClick={() => handleDelete(item.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedId ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Username
                <input name="username" value={form.username} onChange={handleChange} required />
              </label>
              <label>
                Nombre
                <input name="first_name" value={form.first_name} onChange={handleChange} />
              </label>
              <label>
                Apellido
                <input name="last_name" value={form.last_name} onChange={handleChange} />
              </label>
              <label>
                Email
                <input name="email" type="email" value={form.email} onChange={handleChange} />
              </label>
              <label>
                Rol
                <select name="role_id" value={form.role_id} onChange={handleChange}>
                  <option value="">Sin rol</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Estado
                <select
                  name="activo"
                  value={form.activo ? 'true' : 'false'}
                  onChange={(e) => setForm((prev) => ({ ...prev, activo: e.target.value === 'true' }))}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </label>
              <label>
                {selectedId ? 'Nueva Contraseña' : 'Contraseña'}
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={selectedId ? 'Dejar vacío para no cambiar' : 'Ingrese contraseña'}
                  required={!selectedId}
                />
              </label>
              <label>
                {selectedId ? 'Confirmar Contraseña' : 'Confirmar Contraseña'}
                <input
                  type="password"
                  name="password_confirm"
                  value={form.password_confirm}
                  onChange={handleChange}
                  placeholder={selectedId ? 'Dejar vacío para no cambiar' : 'Confirme la contraseña'}
                  required={!selectedId}
                />
              </label>
              <div className="form-actions">
                <button type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : selectedId ? 'Actualizar' : 'Registrar'}
                </button>
                <button type="button" className="button-secondary" onClick={handleCloseModal}>
                  Cerrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsuariosPage;
