import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="panel not-found">
      <h3>Ruta no encontrada</h3>
      <p>La pagina que buscas no existe dentro del panel de cafeteria.</p>
      <Link to="/dashboard" className="button-link">
        Volver al dashboard
      </Link>
    </section>
  );
}

export default NotFoundPage;
