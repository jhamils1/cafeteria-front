import { useEffect, useState } from 'react';
import { FaCalendar, FaSearch } from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getReporteVentas } from '../../api/ventasApi';
import StatusMessage from '../../components/ui/StatusMessage';
import { formatMoney } from '../../utils/format';
import { getApiErrorMessage } from '../../utils/errors';
import './ReporteVentas.css';

function ReporteVentas() {
  const [reporte, setReporte] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    loadReporte();
  }, []);

  async function loadReporte(inicio = null, fin = null) {
    setLoading(true);
    setError('');
    setMensaje('');

    try {
      const datos = await getReporteVentas(inicio, fin);
      setReporte(datos);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo cargar el reporte de ventas'));
    } finally {
      setLoading(false);
    }
  }

  function handleFiltrar() {
    loadReporte(fechaInicio || null, fechaFin || null);
    if (fechaInicio || fechaFin) {
      setMensaje('Filtros aplicados');
    }
  }

  function handleLimpiar() {
    setFechaInicio('');
    setFechaFin('');
    setMensaje('');
    loadReporte();
  }

  if (loading) {
    return (
      <div className="reporte-container">
        <div className="loading">Cargando reporte...</div>
      </div>
    );
  }

  return (
    <div className="reporte-container">
      <div className="reporte-header">
        <h1>📊 Reporte de Ventas</h1>
        <p>Análisis detallado de ventas y productos</p>
      </div>

      {error && <StatusMessage type="error" message={error} />}
      {mensaje && <StatusMessage type="success" message={mensaje} />}

      {/* Filtros */}
      <div className="filtros-section">
        <div className="filtros-grid">
          <div className="filtro-item">
            <label htmlFor="fecha_inicio">
              <FaCalendar /> Fecha Inicio
            </label>
            <input
              id="fecha_inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="input-date"
            />
          </div>

          <div className="filtro-item">
            <label htmlFor="fecha_fin">
              <FaCalendar /> Fecha Fin
            </label>
            <input
              id="fecha_fin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="input-date"
            />
          </div>

          <div className="filtro-acciones">
            <button onClick={handleFiltrar} className="btn btn-primary">
              <FaSearch /> Filtrar
            </button>
            <button onClick={handleLimpiar} className="btn btn-secondary">
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="tarjetas-resumen">
        <div className="tarjeta card-total">
          <div className="tarjeta-icono">💰</div>
          <div className="tarjeta-contenido">
            <h3>Total de Ventas</h3>
            <p className="tarjeta-valor">{formatMoney(reporte?.total_ventas || 0)}</p>
          </div>
        </div>

        <div className="tarjeta card-notas">
          <div className="tarjeta-icono">📋</div>
          <div className="tarjeta-contenido">
            <h3>Cantidad de Notas</h3>
            <p className="tarjeta-valor">{reporte?.cantidad_notas || 0}</p>
          </div>
        </div>

        <div className="tarjeta card-producto">
          <div className="tarjeta-icono">⭐</div>
          <div className="tarjeta-contenido">
            <h3>Producto Más Vendido</h3>
            <p className="tarjeta-valor">
              {reporte?.producto_mas_vendido?.nombre || 'N/A'}
            </p>
            <p className="tarjeta-subtexto">
              {reporte?.producto_mas_vendido?.cantidad_vendida || 0} unidades
            </p>
          </div>
        </div>
      </div>

      {/* Gráfica de Ventas por Día */}
      <div className="grafica-section">
        <div className="section-header">
          <h2>📈 Ventas por Día</h2>
        </div>
        {reporte?.ventas_por_dia && reporte.ventas_por_dia.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={reporte.ventas_por_dia}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0c9b9" />
              <XAxis
                dataKey="fecha"
                stroke="#8b6f47"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#8b6f47" style={{ fontSize: '12px' }} />
              <Tooltip
                formatter={(value) => formatMoney(value)}
                contentStyle={{
                  backgroundColor: '#fef5f0',
                  border: '2px solid #8b6f47',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#8b6f47' }}
              />
              <Legend />
              <Bar
                dataKey="total"
                fill="#9d7e6f"
                name="Total Ventas"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="cantidad"
                fill="#d4a574"
                name="Cantidad de Notas"
                yAxisId="right"
                radius={[8, 8, 0, 0]}
              />
              <YAxis yAxisId="right" orientation="right" stroke="#8b6f47" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="sin-datos">No hay datos de ventas disponibles</p>
        )}
      </div>

      {/* Tabla de Top 5 Clientes */}
      <div className="tabla-section">
        <div className="section-header">
          <h2>👥 Top 5 Clientes por Monto Comprado</h2>
        </div>
        {reporte?.top_clientes && reporte.top_clientes.length > 0 ? (
          <div className="tabla-wrapper">
            <table className="tabla-reporte">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Total Comprado</th>
                  <th>Cantidad de Compras</th>
                  <th>Promedio por Compra</th>
                </tr>
              </thead>
              <tbody>
                {reporte.top_clientes.map((cliente, index) => (
                  <tr key={cliente.id} className={index % 2 === 0 ? 'par' : 'impar'}>
                    <td className="numero">{index + 1}</td>
                    <td className="nombre">{cliente.nombre}</td>
                    <td className="monto">{formatMoney(cliente.total_comprado)}</td>
                    <td className="cantidad">{cliente.cantidad_compras}</td>
                    <td className="promedio">
                      {formatMoney(
                        cliente.cantidad_compras > 0
                          ? cliente.total_comprado / cliente.cantidad_compras
                          : 0
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="sin-datos">No hay clientes disponibles</p>
        )}
      </div>

      {/* Ranking de Empleados */}
      <div className="tabla-section">
        <div className="section-header">
          <h2>👨‍🍳 Ranking de Empleados</h2>
        </div>
        {reporte?.top_empleados && reporte.top_empleados.length > 0 ? (
          <div className="tabla-wrapper">
            <table className="tabla-reporte">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Empleado</th>
                  <th>Cantidad de Notas Emitidas</th>
                  <th>Total Vendido</th>
                </tr>
              </thead>
              <tbody>
                {reporte.top_empleados.map((empleado, index) => (
                  <tr key={empleado.id} className={index % 2 === 0 ? 'par' : 'impar'}>
                    <td className="numero">{index + 1}</td>
                    <td className="nombre">{empleado.nombre}</td>
                    <td className="cantidad">{empleado.cantidad_notas}</td>
                    <td className="monto">{formatMoney(empleado.total_vendido)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="sin-datos">No hay datos de empleados disponibles</p>
        )}
      </div>
    </div>
  );
}

export default ReporteVentas;
