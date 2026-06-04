import { useEffect, useMemo, useState } from 'react';
import { FaEye, FaMinus, FaPlus, FaPrint, FaSearch, FaTimes, FaTrash } from 'react-icons/fa';
import { getProductos } from '../../api/productosApi';
import {
  createNotaVenta,
  deleteNotaVenta,
  getClientes,
  getDetallesVenta,
  getNotasVenta,
} from '../../api/ventasApi';
import StatusMessage from '../../components/ui/StatusMessage';
import { formatMoney } from '../../utils/format';
import { getApiErrorMessage } from '../../utils/errors';

const initialDetalle = { producto: '', cantidad: 1, descuento_porcentaje: 0 };

function NotasVentaPage() {
  const [notas, setNotas] = useState([]);
  const [detallesVenta, setDetallesVenta] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cliente, setCliente] = useState('');
  const [observacion, setObservacion] = useState('');
  const [detalles, setDetalles] = useState([initialDetalle]);
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [selectedNotaId, setSelectedNotaId] = useState(null);
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [notasData, clientesData, productosData, detallesData] = await Promise.all([
        getNotasVenta(),
        getClientes(),
        getProductos(),
        getDetallesVenta(),
      ]);
      setNotas(notasData);
      setClientes(clientesData);
      setProductos(productosData.filter((item) => item.estado));
      setDetallesVenta(detallesData);
      setSelectedNotaId((prev) => {
        if (prev && notasData.some((item) => item.id === prev)) {
          return prev;
        }
        return notasData[0]?.id || null;
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo cargar notas de venta'));
    } finally {
      setLoading(false);
    }
  }

  function getProducto(productId) {
    return productos.find((item) => String(item.id) === String(productId));
  }

  function calcularSubtotal(item) {
    const producto = getProducto(item.producto);
    if (!producto) {
      return 0;
    }
    const precio = Number(producto.precio_venta || 0);
    const cantidad = Number(item.cantidad || 0);
    const descuentoPorcentaje = Number(item.descuento_porcentaje || 0);
    const descuento = (precio * cantidad * descuentoPorcentaje) / 100;
    return precio * cantidad - descuento;
  }

  function handleDetalleChange(index, field, value) {
    setDetalles((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function addDetalle() {
    setDetalles((prev) => [...prev, { ...initialDetalle }]);
  }

  function removeDetalle(index) {
    if (detalles.length === 1) {
      return;
    }
    setDetalles((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  }

  function cambiarCantidad(index, delta) {
    setDetalles((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }
        const nuevaCantidad = Math.max(1, Number(item.cantidad || 1) + delta);
        return { ...item, cantidad: nuevaCantidad };
      }),
    );
  }

  const totalEstimado = useMemo(() => {
    return detalles.reduce((acc, item) => acc + calcularSubtotal(item), 0);
  }, [detalles, productos]);

  const clientesMap = useMemo(
    () => new Map(clientes.map((item) => [String(item.id), item.nombre])),
    [clientes],
  );

  const notasFiltradas = useMemo(() => {
    const texto = search.trim().toLowerCase();
    const hoy = new Date().toDateString();

    return notas.filter((item) => {
      if (filtro === 'hoy' && new Date(item.fecha).toDateString() !== hoy) {
        return false;
      }

      if (!texto) {
        return true;
      }

      const clienteNombre = (clientesMap.get(String(item.cliente)) || '').toLowerCase();
      return String(item.id).includes(texto) || clienteNombre.includes(texto);
    });
  }, [notas, search, filtro, clientesMap]);

  const selectedNota = useMemo(
    () => notas.find((item) => item.id === selectedNotaId) || null,
    [notas, selectedNotaId],
  );

  const selectedDetalles = useMemo(() => {
    if (!selectedNota) {
      return [];
    }
    return detallesVenta.filter((item) => item.nota_venta === selectedNota.id);
  }, [detallesVenta, selectedNota]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        cliente: Number(cliente),
        observacion,
        detalles: detalles.map((item) => {
          const producto = productos.find((prod) => String(prod.id) === String(item.producto));

          return {
            producto: Number(item.producto),
            cantidad: Number(item.cantidad),
            descuento_porcentaje: Number(item.descuento_porcentaje || 0),
            precio_unitario: Number(producto?.precio_venta || 0),
          };
        }),
      };

      const nuevaNota = await createNotaVenta(payload);
      setCliente('');
      setObservacion('');
      setDetalles([{ ...initialDetalle }]);
      await loadData();
      setSelectedNotaId(nuevaNota?.id || null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo registrar la nota de venta'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Deseas eliminar esta nota de venta?');
    if (!confirmed) {
      return;
    }

    try {
      await deleteNotaVenta(id);
      await loadData();
      if (selectedNotaId === id) {
        setSelectedNotaId(null);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo eliminar la nota de venta'));
    }
  }

  function imprimirNota(nota) {
    if (!nota) {
      return;
    }

    const notaCliente = clientesMap.get(String(nota.cliente)) || `Cliente #${nota.cliente}`;
    const notaEmpleado = nota.empleado ? `Empleado #${nota.empleado}` : 'No registrado';
    const fechaNota = new Date(nota.fecha).toLocaleString('es-BO');
    const detallesImpresion = detallesVenta.filter((item) => item.nota_venta === nota.id);

    const filasProductos = detallesImpresion.length
      ? detallesImpresion
          .map((detalle) => {
            const producto = getProducto(detalle.producto);
            const nombreProducto = producto?.nombre || `Producto #${detalle.producto}`;
            return `
              <tr>
                <td>${nombreProducto}</td>
                <td style="text-align:center;">${detalle.cantidad}</td>
                <td style="text-align:right;">${formatMoney(detalle.precio_unitario)}</td>
                <td style="text-align:right;">${formatMoney(detalle.descuento || 0)}</td>
                <td style="text-align:right;">${formatMoney(detalle.subtotal)}</td>
              </tr>
            `;
          })
          .join('')
      : `
        <tr>
          <td colspan="5" style="text-align:center; padding:12px 0;">No hay detalles para esta nota.</td>
        </tr>
      `;

    const printWindow = window.open('', '_blank', 'width=480,height=700');

    if (!printWindow) {
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Ticket Nota ${nota.id}</title>
          <style>
            * {
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 16px;
              font-family: Arial, sans-serif;
              color: #000;
              background: #fff;
            }
            .ticket {
              max-width: 400px;
              margin: 0 auto;
              font-size: 13px;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              margin-bottom: 12px;
            }
            .logo {
              font-size: 22px;
              font-weight: 700;
              margin: 0;
            }
            .subtitle {
              margin: 2px 0 0;
              font-size: 12px;
            }
            .separator {
              border: 0;
              border-top: 1px solid #000;
              margin: 12px 0;
            }
            .meta {
              display: grid;
              gap: 4px;
              margin-bottom: 12px;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              gap: 12px;
            }
            .meta-row span:first-child {
              font-weight: 700;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 12px;
            }
            th, td {
              padding: 6px 4px;
              border-bottom: 1px solid #000;
              vertical-align: top;
            }
            th {
              text-align: left;
              font-size: 12px;
            }
            td {
              font-size: 12px;
            }
            .total {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 18px;
              font-weight: 700;
              margin-top: 8px;
            }
            .footer {
              text-align: center;
              margin-top: 18px;
              font-size: 12px;
            }
            @media print {
              body {
                padding: 0;
              }
              .ticket {
                max-width: 400px;
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <p class="logo">CafeAdmin</p>
              <p class="subtitle">Gestión integral de cafetería</p>
            </div>

            <hr class="separator" />

            <div class="meta">
              <div class="meta-row"><span>N° de Nota:</span><span>${nota.id}</span></div>
              <div class="meta-row"><span>Fecha:</span><span>${fechaNota}</span></div>
              <div class="meta-row"><span>Cliente:</span><span>${notaCliente}</span></div>
              <div class="meta-row"><span>Empleado:</span><span>${notaEmpleado}</span></div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Precio Unit.</th>
                  <th>Desc.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${filasProductos}
              </tbody>
            </table>

            <hr class="separator" />

            <div class="total">
              <span>Total</span>
              <span>${formatMoney(nota.total)}</span>
            </div>

            <div class="footer">Gracias por su compra</div>
          </div>
          <script>
            window.onload = function () {
              window.print();
              window.onafterprint = function () {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  }

  return (
    <div className="notas-board">
      <div className="notas-main-stack">
        <div className="page-header" style={{ padding: '0.25rem 0 1rem 0' }}>
          <h3 style={{ margin: 0, color: 'var(--coffee-strong)' }}>Notas de Venta</h3>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Nuevo Nota de Venta</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>

              {modalError && <div className="error-message">{modalError}</div>}

              <form className="form-grid" onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                setModalError('');
                try {
                  const payload = {
                    cliente: Number(cliente),
                    observacion,
                    detalles: detalles.map((item) => ({
                      producto: Number(item.producto),
                      cantidad: Number(item.cantidad),
                      descuento_porcentaje: Number(item.descuento_porcentaje || 0),
                      precio_unitario: Number((productos.find((p) => String(p.id) === String(item.producto))?.precio_venta) || 0),
                    })),
                  };

                  const nuevaNota = await createNotaVenta(payload);
                  // reset form local
                  setCliente('');
                  setObservacion('');
                  setDetalles([{ ...initialDetalle }]);
                  setShowModal(false);
                  await loadData();
                  setSelectedNotaId(nuevaNota?.id || null);
                } catch (err) {
                  const msg = getApiErrorMessage(err, 'No se pudo registrar la nota de venta');
                  setModalError(msg);
                } finally {
                  setSaving(false);
                }
              }}>
                <div className="nota-editor-top">
                  <label>
                    Cliente
                    <select value={cliente} onChange={(event) => setCliente(event.target.value)} required>
                      <option value="">Selecciona un cliente</option>
                      {clientes.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nombre}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Observacion (opcional)
                    <textarea
                      value={observacion}
                      onChange={(event) => setObservacion(event.target.value.slice(0, 250))}
                      rows={2}
                      placeholder="Agrega una observacion..."
                    />
                    <small className="field-hint">{observacion.length} / 250</small>
                  </label>
                </div>

                <div className="detalles-wrap nota-detalles-wrap">
                  <div className="panel-header">
                    <h4>Detalles de la venta</h4>
                    <button type="button" className="button-secondary" onClick={addDetalle}>
                      <FaPlus /> Agregar linea
                    </button>
                  </div>

                  <div className="nota-table-header">
                    <span>Producto</span>
                    <span>Cantidad</span>
                    <span>Precio</span>
                    <span>Descuento %</span>
                    <span>Subtotal</span>
                    <span>Acciones</span>
                  </div>

                  {detalles.map((item, index) => {
                    const producto = getProducto(item.producto);
                    const subtotal = calcularSubtotal(item);
                    return (
                      <div key={`${index}-${item.producto}`} className="nota-detail-row">
                        <select
                          value={item.producto}
                          onChange={(event) => handleDetalleChange(index, 'producto', event.target.value)}
                          required
                        >
                          <option value="">Producto</option>
                          {productos.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.nombre}
                            </option>
                          ))}
                        </select>

                        <div className="qty-control">
                          <button type="button" onClick={() => cambiarCantidad(index, -1)} aria-label="Disminuir cantidad">
                            <FaMinus />
                          </button>
                          <span className="qty-value">{item.cantidad}</span>
                          <button type="button" onClick={() => cambiarCantidad(index, 1)} aria-label="Aumentar cantidad">
                            <FaPlus />
                          </button>
                        </div>

                        <strong>{formatMoney(Number(producto?.precio_venta || 0))}</strong>

                        <div className="discount-control">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.descuento_porcentaje}
                            onChange={(event) => handleDetalleChange(index, 'descuento_porcentaje', event.target.value)}
                          />
                          <span>%</span>
                        </div>

                        <strong>{formatMoney(subtotal)}</strong>

                        <button type="button" className="button-danger soft-danger" onClick={() => removeDetalle(index)} disabled={detalles.length === 1}>
                          <FaTrash />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="total-preview modern-total">
                  <span>Total estimado:</span>
                  <strong>{formatMoney(totalEstimado)}</strong>
                </div>

                <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
                  <button type="submit" className="button-new" disabled={saving}>{saving ? 'Registrando...' : 'Registrar Nota'}</button>
                  <button type="button" className="button-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <section className="panel notas-history-panel">
          <div className="panel-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h3 style={{ margin: 0 }}>Notas de Venta Registradas</h3>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="button-new" onClick={() => { setShowModal(true); setModalError(''); }}>
                ＋ Nueva Nota
              </button>
              <div className="history-actions">
                <select value={filtro} onChange={(event) => setFiltro(event.target.value)}>
                  <option value="todas">Filtro: Todas</option>
                  <option value="hoy">Filtro: Hoy</option>
                </select>
                <label className="search-field">
                  <FaSearch />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por cliente o ID..."
                  />
                </label>
              </div>
            </div>
          </div>

          <StatusMessage loading={loading} error={error} />

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {notasFiltradas.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{clientesMap.get(String(item.cliente)) || item.cliente}</td>
                    <td>{formatMoney(item.total)}</td>
                    <td>{new Date(item.fecha).toLocaleString('es-BO')}</td>
                    <td className="row-actions">
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() => setSelectedNotaId(item.id)}
                      >
                        <FaEye /> Ver detalle
                      </button>
                      <button type="button" className="button-secondary" onClick={() => imprimirNota(item)}>
                        <FaPrint /> Imprimir
                      </button>
                      <button type="button" className="button-danger" onClick={() => handleDelete(item.id)}>
                        <FaTrash /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <aside className="panel nota-side-panel">
        <div className="panel-header">
          <h3>Detalle de la Nota</h3>
          <button type="button" className="icon-button" onClick={() => setSelectedNotaId(null)}>
            <FaTimes />
          </button>
        </div>

        {selectedNota ? (
          <>
            <div className="nota-meta">
              <div><span>ID Nota</span><strong>{selectedNota.id}</strong></div>
              <div><span>Cliente</span><strong>{clientesMap.get(String(selectedNota.cliente)) || selectedNota.cliente}</strong></div>
              <div><span>Fecha</span><strong>{new Date(selectedNota.fecha).toLocaleString('es-BO')}</strong></div>
            </div>

            <div className="nota-side-products">
              <h4>Productos</h4>
              {selectedDetalles.length ? (
                selectedDetalles.map((detalle) => {
                  const product = getProducto(detalle.producto);
                  return (
                    <div key={detalle.id} className="nota-side-row">
                      <span>{product?.nombre || `Producto #${detalle.producto}`}</span>
                      <span>{detalle.cantidad} x {formatMoney(detalle.precio_unitario)}</span>
                      <strong>{formatMoney(detalle.subtotal)}</strong>
                    </div>
                  );
                })
              ) : (
                <p className="muted-empty">No hay detalles para esta nota.</p>
              )}
            </div>

            <div className="nota-side-total">
              <span>Total:</span>
              <strong>{formatMoney(selectedNota.total)}</strong>
            </div>

            <button type="button" className="button-secondary" onClick={() => imprimirNota(selectedNota)}>
              <FaPrint /> Imprimir esta nota
            </button>
          </>
        ) : (
          <p className="muted-empty">Selecciona una nota desde la tabla para ver su detalle.</p>
        )}
      </aside>
    </div>
  );
}

export default NotasVentaPage;
