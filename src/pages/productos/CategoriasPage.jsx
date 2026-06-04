import { useEffect, useState } from 'react';
import {
  createCategoria,
  deleteCategoria,
  getCategorias,
  updateCategoria,
} from '../../api/productosApi';
import './CategoriasPage.css';
import StatusMessage from '../../components/ui/StatusMessage';
import { getApiErrorMessage } from '../../utils/errors';

const initialForm = {
  descripcion: '',
};

function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadCategorias();
  }, []);

  async function loadCategorias() {
    setLoading(true);
    setError('');
    try {
      const data = await getCategorias();
      setCategorias(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar categorías'));
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

  function handleEdit(categoria) {
    setSelectedId(categoria.id);
    setForm({
      descripcion: categoria.descripcion || '',
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
        await updateCategoria(selectedId, form);
      } else {
        await createCategoria(form);
      }
      handleCloseModal();
      await loadCategorias();
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo guardar la categoría'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('¿Deseas eliminar esta categoría?');
    if (!confirmed) return;
    try {
      await deleteCategoria(id);
      await loadCategorias();
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo eliminar la categoría'));
    }
  }

  return (
    <div className="page-container">
      <div className="list-header">
        <h2>Categorías</h2>
        <button className="button-new" onClick={() => setShowModal(true)}>
          ＋ Nueva Categoría
        </button>
      </div>
      <StatusMessage loading={loading} error={error} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.descripcion}</td>
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
              <h3>{selectedId ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Descripción
                <input
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  required
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

export default CategoriasPage;
