import { useEffect, useState } from 'react';
import {
  createProducto,
  deleteProducto,
  getCategorias,
  getProductos,
  updateProducto,
} from '../../api/productosApi';
import './ProductosPage.css';
import { formatMoney } from '../../utils/format';
import StatusMessage from '../../components/ui/StatusMessage';
import { getApiErrorMessage } from '../../utils/errors';

const initialForm = {
  nombre: '',
  codigo: '',
  categoria: '',
  precio_venta: '',
  stock: 0,
  estado: true,
};

function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
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
      const [productosData, categoriasData] = await Promise.all([
        getProductos(),
        getCategorias(),
      ]);
      setProductos(productosData);
      setCategorias(categoriasData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar productos'));
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

  function handleEdit(producto) {
    setSelectedId(producto.id);
    setForm({
      nombre: producto.nombre || '',
      codigo: producto.codigo || '',
      categoria: String(producto.categoria || ''),
      precio_venta: String(producto.precio_venta || ''),
      stock: producto.stock || 0,
      estado: producto.estado !== undefined ? Boolean(producto.estado) : true,
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
        nombre: form.nombre,
        codigo: form.codigo,
        categoria: Number(form.categoria),
        precio_venta: Number(form.precio_venta),
        stock: Number(form.stock),
        estado: form.estado,
      };
      if (selectedId) {
        await updateProducto(selectedId, payload);
      } else {
        await createProducto(payload);
      }
      handleCloseModal();
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo guardar el producto'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('¿Deseas eliminar este producto?');
    if (!confirmed) return;
    try {
      await deleteProducto(id);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo eliminar el producto'));
    }
  }

  return (
    <div className="page-container">
      <div className="list-header">
        <h2>Productos</h2>
        <button className="button-new" onClick={() => setShowModal(true)}>
          ＋ Nuevo Producto
        </button>
      </div>
      <StatusMessage loading={loading} error={error} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((item) => (
              <tr key={item.id}>
                <td>{item.codigo || '-'}</td>
                <td>{item.nombre}</td>
                <td>{item.categoria_name || '-'}</td>
                <td>{formatMoney(item.precio_venta)}</td>
                <td>{item.stock}</td>
                <td>{item.estado ? 'Sí' : 'No'}</td>
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
              <h3>{selectedId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Nombre
                <input name="nombre" value={form.nombre} onChange={handleChange} required />
              </label>
              <label>
                Código
                <input name="codigo" value={form.codigo} onChange={handleChange} required />
              </label>
              <label>
                Categoría
                <select name="categoria" value={form.categoria} onChange={handleChange} required>
                  <option value="">Selecciona</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.descripcion}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Precio venta
                <input
                  name="precio_venta"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.precio_venta}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Stock
                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="checkbox-row">
                <input type="checkbox" name="estado" checked={form.estado} onChange={handleChange} />
                Producto activo
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

export default ProductosPage;
