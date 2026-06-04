function StatusMessage({ error, loading }) {
  if (loading) {
    return <p className="feedback loading">Cargando datos...</p>;
  }

  if (error) {
    return <p className="feedback error">{error}</p>;
  }

  return null;
}

export default StatusMessage;
