import { useEffect, useState } from 'react';
import './ClientesPage.css';
import { createCliente, deleteCliente, getClientes, updateCliente } from '../../api/ventasApi';
import StatusMessage from '../../components/ui/StatusMessage';
import { getApiErrorMessage } from '../../utils/errors';

const initialForm = {
  nombre: '',
  email: '',
  celular: '',
  direccion: '',
  ci_nit: '',
  fecha_nacimiento: '',
};

function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadClientes();
  }, []);

  async function loadClientes() {
    setLoading(true);
    setError('');
    try {
      const data = await getClientes();
      setClientes(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar los clientes'));
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

  function handleEdit(cliente) {
    setSelectedId(cliente.id);
    setForm({
      nombre: cliente.nombre || '',
      email: cliente.email || '',
      celular: cliente.celular || '',
      direccion: cliente.direccion || '',
      ci_nit: cliente.ci_nit || '',
      fecha_nacimiento: cliente.fecha_nacimiento || '',
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
      if (selectedId) {
        await updateCliente(selectedId, form);
      } else {
        await createCliente(form);
      }
      handleCloseModal();
      await loadClientes();
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo guardar el cliente'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('¿Deseas eliminar este cliente?');
    if (!confirmed) return;
    try {
      await deleteCliente(id);
      await loadClientes();
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo eliminar el cliente'));
    }
  }

  return (
    <div className="page-container">
      <div className="list-header">
        <h2>Clientes</h2>
        <button className="button-new" onClick={() => setShowModal(true)}>
          ＋ Nuevo Cliente
        </button>
      </div>
      <StatusMessage loading={loading} error={error} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Celular</th>
              <th>CI/Teléfono</th>
              <th>NIT</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.nombre}</td>
                <td>{item.email || '-'}</td>
                <td>{item.celular || '-'}</td>
                <td>{item.ci_nit || '-'}</td>
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
              <h3>{selectedId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Nombre
                <input name="nombre" value={form.nombre} onChange={handleChange} required />
              </label>
              <label>
                CI/NIT
                <input name="ci_nit" value={form.ci_nit} onChange={handleChange} required />
              </label>
              <label>
                Email
                <input name="email" type="email" value={form.email} onChange={handleChange} />
              </label>
              <label>
                Celular
                <input name="celular" value={form.celular} onChange={handleChange} />
              </label>
              <label>
                Fecha de Nacimiento
                <input name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} />
              </label>
              <label>
                Dirección
                <input name="direccion" value={form.direccion} onChange={handleChange} />
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

export default ClientesPage;
