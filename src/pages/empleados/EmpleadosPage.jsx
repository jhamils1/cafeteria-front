import { useEffect, useState } from 'react';
import {
  createEmpleado,
  deleteEmpleado,
  getEmpleados,
  getEmpleadosLookups,
  updateEmpleado,
} from '../../api/empleadosApi';
import { createUsuario, getRoles } from '../../api/usuariosApi';
import StatusMessage from '../../components/ui/StatusMessage';
import { getApiErrorMessage } from '../../utils/errors';
import './EmpleadosPage.css';

const initialForm = {
  nombre: '',
  ci: '',
  telefono_fijo: '',
  celular: '',
  telefono_contacto: '',
  email: '',
  direccion: '',
  nombre_contacto: '',
  estado_civil: '',
  nacionalidad: '',
  turno: '',
  tipo_contrato: '',
  activo: true,
  darAcceso: false,
  username: '',
  first_name: '',
  last_name: '',
  email_usuario: '',
  activo_usuario: true,
  password: '',
  password_confirm: '',
};

function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([]);
  const [lookups, setLookups] = useState({
    estadosCiviles: [],
    nacionalidades: [],
    turnos: [],
    tiposContrato: [],
  });
  const [roles, setRoles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [empleadosData, lookupData, rolesData] = await Promise.all([
        getEmpleados(),
        getEmpleadosLookups(),
        getRoles(),
      ]);
      setEmpleados(empleadosData);
      setLookups(lookupData);
      setRoles(rolesData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar empleados'));
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => {
      const newVal = type === 'checkbox' ? checked : value;
      const updated = { ...prev, [name]: newVal };
      // si se está editando el email del empleado y el checkbox darAcceso está activo,
      // copiar automáticamente al campo email_usuario si aún está vacío
      if (name === 'email' && prev.darAcceso && !prev.email_usuario) {
        updated.email_usuario = value;
      }
      // si se activa darAcceso, prefill email_usuario con el email del empleado
      if (name === 'darAcceso' && newVal === true && prev.email && !prev.email_usuario) {
        updated.email_usuario = prev.email;
      }
      return updated;
    });
  }

  function handleEdit(item) {
    setSelectedId(item.id);
    // preferimos campos first_name/last_name si existen
    const fn = item.first_name || (item.nombre ? item.nombre.split(' ')[0] : '');
    const ln = item.last_name || (item.nombre ? item.nombre.split(' ').slice(1).join(' ') : '');
    setForm({
      first_name: fn || '',
      last_name: ln || '',
      ci: item.ci || '',
      telefono_fijo: item.telefono_fijo || '',
      celular: item.celular || '',
      telefono_contacto: item.telefono_contacto || '',
      email: item.email || '',
      direccion: item.direccion || '',
      nombre_contacto: item.nombre_contacto || '',
      estado_civil: String(item.estado_civil || ''),
      nacionalidad: String(item.nacionalidad || ''),
      turno: String(item.turno || ''),
      tipo_contrato: String(item.tipo_contrato || ''),
      activo: Boolean(item.activo),
      darAcceso: false,
      username: '',
      // user fields remain empty when editing; access assignment is separate
      email_usuario: item.email || '',
      activo_usuario: true,
      password: '',
      password_confirm: '',
    });
    setShowModal(true);
    setModalError('');
  }

  function openNewModal() {
    setSelectedId(null);
    setForm(initialForm);
    setShowModal(true);
    setModalError('');
  }

  function closeModal() {
    setShowModal(false);
    setSelectedId(null);
    setForm(initialForm);
    setModalError('');
  }

  function buildPayload() {
    return {
      ...form,
      estado_civil: Number(form.estado_civil),
      nacionalidad: Number(form.nacionalidad),
      turno: Number(form.turno),
      tipo_contrato: Number(form.tipo_contrato),
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setModalError('');

    try {
      // Validar contraseñas si se va a crear usuario
      if (form.darAcceso && !selectedId) {
        if (!form.password) {
          throw new Error('La contraseña es requerida');
        }
        if (form.password !== form.password_confirm) {
          throw new Error('Las contraseñas no coinciden');
        }
        // username puede generarse automáticamente si no se proporciona
      }

      let empleadoCreado;
      if (selectedId) {
        await updateEmpleado(selectedId, buildPayload());
      } else {
        empleadoCreado = await createEmpleado(buildPayload());
      }

      // Crear usuario si se marcó el checkbox
      if (form.darAcceso && !selectedId && empleadoCreado) {
        // Obtener el rol "Empleado/cajero"
        const rolEmpleado = roles.find((r) => r.name === 'Empleado/cajero');
        if (!rolEmpleado) {
          throw new Error('No se encontró el rol "Empleado/cajero"');
        }

        // preparar username: usar el proporcionado o generar a partir de nombre y apellido
        let usernameToUse = form.username && form.username.trim();
        if (!usernameToUse) {
          const fn = (form.first_name || '').split(' ')[0] || '';
          const ln = (form.last_name || '').split(' ')[0] || '';
          usernameToUse = (fn || ln) ? `${fn}.${ln}`.replace(/\s+/g, '').toLowerCase() : (form.ci ? String(form.ci) : `u${Date.now()}`);
        }

        const usuarioCreado = await createUsuario({
          username: usernameToUse,
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email_usuario || form.email || '',
          password: form.password,
          password_confirm: form.password_confirm,
          activo_write: form.activo_usuario,
          group_ids: [rolEmpleado.id],
        });

        // vincular usuario al empleado creado
        if (usuarioCreado && usuarioCreado.id) {
          await updateEmpleado(empleadoCreado.id, { ...buildPayload(), user: usuarioCreado.id });
        }
      }

      closeModal();
      await loadData();
    } catch (err) {
      setModalError(typeof err === 'string' ? err : getApiErrorMessage(err, 'No se pudo guardar el empleado'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Deseas eliminar este empleado?');
    if (!confirmed) {
      return;
    }

    try {
      await deleteEmpleado(id);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo eliminar el empleado'));
    }
  }

  return (
    <div className="page-container">
      <section className="panel">
        <div className="list-header">
          <h3>Lista de Empleados</h3>
          <button className="button-new" onClick={openNewModal}>
            ＋ Nuevo Empleado
          </button>
        </div>
        <StatusMessage loading={loading} error={error} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>CI</th>
                <th>Email</th>
                <th>Celular</th>
                <th>Teléfono Fijo</th>
                <th>Estado Civil</th>
                <th>Nacionalidad</th>
                <th>Turno</th>
                <th>Tipo Contrato</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((item) => (
                <tr key={item.id}>
                  <td>{(item.first_name || item.last_name) ? `${item.first_name || ''} ${item.last_name || ''}`.trim() : item.nombre}</td>
                  <td>{item.ci}</td>
                  <td>{item.email || '-'}</td>
                  <td>{item.celular || '-'}</td>
                  <td>{item.telefono_fijo || '-'}</td>
                  <td>{item.estado_civil_display || '-'}</td>
                  <td>{item.nacionalidad_display || '-'}</td>
                  <td>{item.turno_display || '-'}</td>
                  <td>{item.tipo_contrato_display || '-'}</td>
                  <td>{item.activo ? 'Si' : 'No'}</td>
                  <td className="row-actions">
                    <button type="button" className="button-secondary" onClick={() => handleEdit(item)}>
                      Editar
                    </button>
                    <button type="button" className="button-danger" onClick={() => handleDelete(item.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedId ? 'Editar Empleado' : 'Nuevo Empleado'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            {modalError && (
              <div className="error-message">
                {modalError}
              </div>
            )}

            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Nombre
                <input name="first_name" value={form.first_name} onChange={handleChange} required />
              </label>
              <label>
                Apellido
                <input name="last_name" value={form.last_name} onChange={handleChange} required />
              </label>
              <label>
                CI
                <input name="ci" value={form.ci} onChange={handleChange} required />
              </label>
              <label>
                Celular
                <input name="celular" value={form.celular} onChange={handleChange} />
              </label>
              <label>
                Telefono fijo
                <input name="telefono_fijo" value={form.telefono_fijo} onChange={handleChange} />
              </label>
              <label>
                Telefono contacto
                <input name="telefono_contacto" value={form.telefono_contacto} onChange={handleChange} />
              </label>
              <label>
                Email
                <input name="email" type="email" value={form.email} onChange={handleChange} />
              </label>
              <label>
                Direccion
                <input name="direccion" value={form.direccion} onChange={handleChange} />
              </label>
              <label>
                Contacto de emergencia
                <input name="nombre_contacto" value={form.nombre_contacto} onChange={handleChange} />
              </label>
              <label>
                Estado civil
                <select name="estado_civil" value={form.estado_civil} onChange={handleChange} required>
                  <option value="">Selecciona</option>
                  {lookups.estadosCiviles.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.descripcion}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Nacionalidad
                <select name="nacionalidad" value={form.nacionalidad} onChange={handleChange} required>
                  <option value="">Selecciona</option>
                  {lookups.nacionalidades.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.descripcion}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Turno
                <select name="turno" value={form.turno} onChange={handleChange} required>
                  <option value="">Selecciona</option>
                  {lookups.turnos.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.descripcion}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tipo contrato
                <select name="tipo_contrato" value={form.tipo_contrato} onChange={handleChange} required>
                  <option value="">Selecciona</option>
                  {lookups.tiposContrato.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.descripcion}
                    </option>
                  ))}
                </select>
              </label>
              <label className="checkbox-row">
                <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} />
                Empleado activo
              </label>

              {!selectedId && (
                <label className="checkbox-row">
                  <input type="checkbox" name="darAcceso" checked={form.darAcceso} onChange={handleChange} />
                  ¿Dar acceso al sistema?
                </label>
              )}

              {form.darAcceso && !selectedId && (
                <div className="user-fields-section">
                  <hr />
                  <h4>Datos de acceso al sistema</h4>
                  <label>
                    Username *
                    <input name="username" value={form.username} onChange={handleChange} required={form.darAcceso} />
                  </label>
                  {/* Nombre y Apellido se toman automáticamente del formulario del empleado */}
                  <label>
                    Rol: Empleado/cajero
                    <input type="text" value="Empleado/cajero" disabled readOnly />
                  </label>
                  <label className="checkbox-row">
                    <input type="checkbox" name="activo_usuario" checked={form.activo_usuario} onChange={handleChange} />
                    Usuario activo
                  </label>
                  <label>
                    Contraseña *
                    <input name="password" type="password" value={form.password} onChange={handleChange} required={form.darAcceso} />
                  </label>
                  <label>
                    Confirmar contraseña *
                    <input name="password_confirm" type="password" value={form.password_confirm} onChange={handleChange} required={form.darAcceso} />
                  </label>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : selectedId ? 'Actualizar' : 'Registrar'}
                </button>
                <button type="button" className="button-secondary" onClick={closeModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmpleadosPage;
