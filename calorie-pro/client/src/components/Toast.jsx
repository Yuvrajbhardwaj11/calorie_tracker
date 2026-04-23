export default function Toast({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type || "success"}`}>
          <span>{t.type === "error" ? "✕" : t.type === "info" ? "ℹ" : "✓"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
