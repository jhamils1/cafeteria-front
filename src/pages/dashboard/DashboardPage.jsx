import { useEffect, useState } from 'react';
import { getDashboardSummary } from '../../api/dashboardApi';
import StatusMessage from '../../components/ui/StatusMessage';
import { formatMoney } from '../../utils/format';
import { getApiErrorMessage } from '../../utils/errors';

const cards = [
  { key: 'usuarios', label: 'Usuarios' },
  { key: 'empleados', label: 'Empleados' },
  { key: 'productos', label: 'Productos' },
  { key: 'productosActivos', label: 'Productos Activos' },
  { key: 'clientes', label: 'Clientes' },
  { key: 'notasVenta', label: 'Notas de Venta' },
  { key: 'stockBajo', label: 'Stock Bajo' },
];

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    setLoading(true);
    setError('');

    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo cargar el dashboard'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-grid">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Resumen Operativo</p>
          <h3>Indicadores en tiempo real de la cafeteria</h3>
        </div>
        <button type="button" className="button-secondary" onClick={loadSummary}>
          Actualizar
        </button>
      </section>

      <StatusMessage loading={loading} error={error} />

      {summary ? (
        <>
          <section className="stats-grid">
            {cards
              .filter((card) => summary.availableCards?.includes(card.key))
              .map((card) => (
              <article key={card.key} className="stat-card">
                <p>{card.label}</p>
                <strong>{summary[card.key]}</strong>
              </article>
            ))}
          </section>

          {summary.availableCards?.includes('totalVentas') ? (
            <section className="hero-panel accent">
              <div>
                <p className="eyebrow">Facturacion acumulada</p>
                <h3>{formatMoney(summary.totalVentas || 0)}</h3>
              </div>
              <span>Base: notas de venta registradas</span>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export default DashboardPage;
