// Estado vacío reutilizable: icono, título, explicación y una acción opcional
export default function EmptyState({ title, children, action, icon = "servers" }) {
  return (
    <div className="empty-state">
      <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        {icon === "search" ? (
          <>
            <circle cx="21" cy="21" r="12" />
            <path d="M30 30l10 10" strokeLinecap="round" />
          </>
        ) : (
          <>
            <rect x="8" y="8" width="32" height="12" rx="3" />
            <rect x="8" y="28" width="32" height="12" rx="3" />
            <path d="M14 14h2M14 34h2" strokeLinecap="round" />
          </>
        )}
      </svg>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
