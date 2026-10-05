export default function ErrorState({ message, onRetry }) {
  return (
    <div className="empty-state" role="alert">
      <h3>No se pudieron cargar los datos</h3>
      <p>{message}</p>
      <button className="btn" onClick={onRetry}>
        Reintentar
      </button>
    </div>
  );
}
