import { useEffect, useState } from 'react';
import {
  createSalario,
  deleteSalario,
  getEmpleados,
  getSalarios,
  updateSalario,
} from '../../api/empleadosApi';
import './SalariosPage.css';
import { formatMoney } from '../../utils/format';
import StatusMessage from '../../components/ui/StatusMessage';
import { getApiErrorMessage } from '../../utils/errors';

const initialForm = {
  empleado: '',
  monto: '',
  fecha_inicio: '',
  fecha_fin: '',
};

function SalariosPage() {
  const [salarios, setSalarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
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
      const [saliosData, empleadosData] = await Promise.all([
        getSalarios(),
        getEmpleados(),
      ]);
      setSalarios(saliosData);
      setEmpleados(empleadosData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar salarios'));
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

  function handleEdit(salario) {
    setSelectedId(salario.id);
    setForm({
      empleado: String(salario.empleado || ''),
      monto: String(salario.monto || ''),
      fecha_inicio: salario.fecha_inicio || '',
      fecha_fin: salario.fecha_fin || '',
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
        empleado: Number(form.empleado),
        monto: Number(form.monto),
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
      };
      if (selectedId) {
        await updateSalario(selectedId, payload);
      } else {
        await createSalario(payload);
      }
      handleCloseModal();
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo guardar el salario'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('¿Deseas eliminar este registro de salario?');
    if (!confirmed) return;
    try {
      await deleteSalario(id);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo eliminar el salario'));
    }
  }

  return (
    <div className="page-container">
      <div className="list-header">
        <h2>Salarios</h2>
        <button className="button-new" onClick={() => setShowModal(true)}>
          ＋ Nuevo Salario
        </button>
      </div>
      <StatusMessage loading={loading} error={error} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Empleado</th>
              <th>Monto</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {salarios.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.empleado_name || '-'}</td>
                <td>{formatMoney(item.monto)}</td>
                <td>{item.fecha_inicio || '-'}</td>
                <td>{item.fecha_fin || '-'}</td>
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
              <h3>{selectedId ? 'Editar Salario' : 'Nuevo Salario'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Empleado
                <select name="empleado" value={form.empleado} onChange={handleChange} required>
                  <option value="">Selecciona</option>
                  {empleados.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Monto
                <input
                  name="monto"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.monto}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Fecha Inicio
                <input
                  name="fecha_inicio"
                  type="date"
                  value={form.fecha_inicio}
                  onChange={handleChange}
                />
              </label>
              <label>
                Fecha Fin
                <input
                  name="fecha_fin"
                  type="date"
                  value={form.fecha_fin}
                  onChange={handleChange}
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

export default SalariosPage;
