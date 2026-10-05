import { Link } from "react-router";
import EmptyState from "../components/EmptyState.jsx";

export default function NotFoundPage() {
  return (
    <EmptyState title="Página no encontrada" icon="search" action={<Link className="btn" to="/dashboard">Ir al dashboard</Link>}>
      La dirección no existe.
    </EmptyState>
  );
}
