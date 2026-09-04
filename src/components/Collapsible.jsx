import { useState } from "react";

export default function Collapsible({ title, defaultOpen = false, badge, actions, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="panel collapsible">
      <div className="collapse-head">
        <button
          className="collapse-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? `Ocultar ${title}` : `Mostrar ${title}`}
        >
          <span className="chevron">{open ? "▾" : "▸"}</span>
          <span className="collapse-title">
            {title}
            {badge ? <span className="custom-badge">{badge}</span> : null}
          </span>
        </button>
        {actions && <div className="collapse-actions">{actions}</div>}
      </div>
      {open && <div className="collapse-body">{children}</div>}
    </div>
  );
}