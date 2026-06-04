import { useEffect, useState } from 'react';
import './RolesPage.css';
import { createRole, deleteRole, getRoles, getPermissions, updateRole } from '../../api/usuariosApi';
import StatusMessage from '../../components/ui/StatusMessage';
import { getApiErrorMessage } from '../../utils/errors';
import { getPermisoBlueprintNames } from '../../utils/permisosMap';

const initialForm = {
  name: '',
  permissions: [],
};

function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [rolesData, permsData] = await Promise.all([getRoles(), getPermissions()]);
      setRoles(rolesData);
      setPermissions(permsData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar los roles'));
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handlePermissionChange(permId) {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId],
    }));
  }

  function handleEdit(rol) {
    setSelectedId(rol.id);
    setForm({
      name: rol.name || '',
      permissions: rol.permissions?.map((p) => p.id) || [],
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
        name: form.name,
        permissions: form.permissions,
      };
      if (selectedId) {
        await updateRole(selectedId, payload);
      } else {
        await createRole(payload);
      }
      handleCloseModal();
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo guardar el rol'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('¿Deseas eliminar este rol?');
    if (!confirmed) return;
    try {
      await deleteRole(id);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo eliminar el rol'));
    }
  }

  return (
    <div className="page-container">
      <div className="list-header">
        <h2>Roles</h2>
        <button className="button-new" onClick={() => setShowModal(true)}>
          ＋ Nuevo Rol
        </button>
      </div>
      <StatusMessage loading={loading} error={error} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Permisos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>
                  {item.permissions && item.permissions.length > 0
                    ? item.permissions
                        .map((p) =>
                          // p may be an object with codename, or a string
                          getPermisoBlueprintNames(p.codename || p.name || p)
                        )
                        .join(', ')
                    : '-'}
                </td>
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
              <h3>{selectedId ? 'Editar Rol' : 'Nuevo Rol'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Nombre del Rol
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>
              <fieldset>
                <legend>Permisos</legend>
                <div className="permissions-grid">
                  {permissions.map((perm) => (
                    <label key={perm.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(perm.id)}
                        onChange={() => handlePermissionChange(perm.id)}
                      />
                      {getPermisoBlueprintNames(perm.codename || perm.name)}
                    </label>
                  ))}
                </div>
              </fieldset>
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

export default RolesPage;
