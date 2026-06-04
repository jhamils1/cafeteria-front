import { useEffect, useState } from 'react';
import { getBitacoras } from '../../api/usuariosApi';
import StatusMessage from '../../components/ui/StatusMessage';
import { formatDate } from '../../utils/format';
import { getApiErrorMessage } from '../../utils/errors';

function BitacoraPage() {
  const [bitacoras, setBitacoras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBitacoras();
  }, []);

  async function loadBitacoras() {
    setLoading(true);
    setError('');

    try {
      const data = await getBitacoras();
      setBitacoras(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo cargar la bitacora'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Bitacora del Sistema</h3>
        <button type="button" className="button-secondary" onClick={loadBitacoras}>
          Actualizar
        </button>
      </div>
      <StatusMessage loading={loading} error={error} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Accion</th>
              <th>Detalle</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {bitacoras.map((item) => (
              <tr key={item.id}>
                <td>{item.usuario}</td>
                <td>{item.accion}</td>
                <td>{item.detalle || '-'}</td>
                <td>{formatDate(item.fecha)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default BitacoraPage;
