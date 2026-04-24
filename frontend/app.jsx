/* global React, ReactDOM, IPRA_DATA, LEVEL_STYLES */
const { useState, useMemo } = React;

// ---------- Small building blocks ----------
function LevelBadge({ level, size = "md" }) {
  const s = LEVEL_STYLES[level] || LEVEL_STYLES["Moderado"];
  return (
    <span
      className="level-badge"
      style={{
        background: s.bg,
        color: s.fg,
        boxShadow: `inset 0 0 0 1px ${s.ring}55`,
        padding: size === "sm" ? "3px 8px" : "4px 10px",
        fontSize: size === "sm" ? 11 : 12,
      }}
    >
      <span className="bullet" />
      {level}
    </span>
  );
}

function ScoreDial({ value, level }) {
  const s = LEVEL_STYLES[level] || LEVEL_STYLES["Moderado"];
  const circ = 2 * Math.PI * 62;
  const pct = Math.max(0, Math.min(100, value)) / 100;
  return (
    <div className="score-dial" aria-label={`IPRA global ${value}`}>
      <svg viewBox="0 0 160 160">
        <circle className="track" cx="80" cy="80" r="62" />
        <circle
          className="fill"
          cx="80" cy="80" r="62"
          style={{ stroke: s.fg, strokeDasharray: circ, strokeDashoffset: circ * (1 - pct) }}
        />
      </svg>
      <div className="num">
        <div>
          {value.toFixed(1)}
          <small>puntos / 100</small>
        </div>
      </div>
    </div>
  );
}

// Chevron / icons
const Icon = {
  download: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  ),
  share: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
  ),
  clock: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  kpi: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
  ),
  arrowUp: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  arrowDown: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
};

// ---------- Nav ----------
function Nav({ active, onNav }) {
  const items = [
    { group: "Panel", entries: [
      { id: "overview", label: "Resumen IPRA" },
      { id: "plans", label: "Planes de intervención" },
      { id: "evaluators", label: "Evaluadores" },
      { id: "history", label: "Histórico" },
    ]},
    { group: "Organización", entries: [
      { id: "supervisors", label: "Supervisores" },
      { id: "areas", label: "Áreas y plantas" },
      { id: "benchmarks", label: "Baremos LATAM" },
    ]},
    { group: "Sistema", entries: [
      { id: "settings", label: "Configuración" },
      { id: "help", label: "Ayuda" },
    ]},
  ];
  return (
    <aside className="nav">
      <div className="brand">
        <img src="assets/talentha-mark.png" alt="Talentha" className="brand-mark" />
        <div>
          <div className="brand-name">Talentha</div>
          <div className="brand-sub">IPRA · v2.4</div>
        </div>
      </div>

      {items.map(g => (
        <div className="nav-group" key={g.group}>
          <h6>{g.group}</h6>
          {g.entries.map(e => (
            <a
              key={e.id}
              className={"nav-item " + (active === e.id ? "active" : "")}
              onClick={(ev) => { ev.preventDefault(); onNav(e.id); }}
              href="#"
            >
              <span className="dot" />
              <span>{e.label}</span>
            </a>
          ))}
        </div>
      ))}

      <div className="nav-footer">
        <div className="avatar">CM</div>
        <div>
          <div className="who">Carolina Mejía</div>
          <div className="who-sub">Analista HSE</div>
        </div>
      </div>
    </aside>
  );
}

// ---------- Topbar ----------
function Topbar({ onExport }) {
  return (
    <div className="topbar">
      <div className="crumbs">
        <span>Panel</span><span className="sep">/</span>
        <span>Supervisores</span><span className="sep">/</span>
        <strong>Sofía Moreno</strong>
        <span className="select-chip">PLAN DE INTERVENCIÓN</span>
      </div>
      <div className="top-actions">
        <button className="btn ghost">{Icon.share} Compartir</button>
        <button className="btn" onClick={onExport}>{Icon.download} Exportar PDF</button>
        <button className="btn primary">Asignar plan</button>
      </div>
    </div>
  );
}

// ---------- Hero ----------
function Hero({ data }) {
  const { supervisor: s, ipraGlobal: g } = data;
  return (
    <section className="hero">
      <div>
        <div className="hero-meta">
          <span>REPORTE<b>IPRA-2026-Q1-247</b></span>
          <span>GENERADO<b>{s.reportDate}</b></span>
          <span>PERÍODO<b>{s.period}</b></span>
          <span>EVALUADORES<b>{s.evaluators}</b></span>
        </div>
        <h1>
          Plan de <em>Intervención</em><br/>IPRA
        </h1>
        <p className="hero-sub">
          Diagnóstico y hoja de ruta priorizada para reducir el riesgo humano
          medido por el Índice Predictivo de Riesgo en Seguridad.
        </p>
        <div className="hero-supervisor">
          <div className="avatar">SM</div>
          <div className="who-col">
            <div className="who-name">{s.name}</div>
            <div className="who-meta">{s.role}</div>
            <div className="who-meta">{s.site}</div>
            <div className="who-id">{s.id}</div>
          </div>
        </div>
      </div>

      <div className="score-card">
        <ScoreDial value={g.score} level={g.level} />
        <div className="score-right">
          <div className="eyebrow">IPRA Global</div>
          <h3>Índice Predictivo de Riesgo en Seguridad</h3>
          <LevelBadge level={g.level} />
          <p>
            El resultado ubica al supervisor en el percentil {g.percentile} del
            baremo LATAM. Se requiere intervención inmediata sobre las 4 dimensiones
            de mayor peso.
          </p>
        </div>
      </div>
    </section>
  );
}

// ---------- KPI strip ----------
function KpiStrip({ data }) {
  const dims = data.dimensions;
  const critical = dims.filter(d => d.level === "Crítico").length;
  const avg = (dims.reduce((s, d) => s + d.score, 0) / dims.length).toFixed(1);
  const wAvg = (
    dims.reduce((s, d) => s + d.score * d.weight, 0) /
    dims.reduce((s, d) => s + d.weight, 0)
  ).toFixed(1);

  return (
    <div className="kpi-strip">
      <div className="kpi">
        <div className="kpi-label">Dimensiones críticas</div>
        <div className="kpi-value">{critical}<span className="unit">/ 8</span></div>
        <div className="kpi-trend"><span className="down">{Icon.arrowUp}</span> +2 vs. Q4 2025</div>
      </div>
      <div className="kpi">
        <div className="kpi-label">Score promedio</div>
        <div className="kpi-value">{avg}</div>
        <div className="kpi-trend"><span className="down">{Icon.arrowDown}</span> −4.8 pts</div>
      </div>
      <div className="kpi">
        <div className="kpi-label">Score ponderado</div>
        <div className="kpi-value">{wAvg}</div>
        <div className="kpi-trend">Peso por dimensión aplicado</div>
      </div>
      <div className="kpi">
        <div className="kpi-label">Plazo más próximo</div>
        <div className="kpi-value" style={{ color: "#7F1D1D" }}>15 <span className="unit">días</span></div>
        <div className="kpi-trend">6 dimensiones en 0–15 días</div>
      </div>
    </div>
  );
}

// ---------- Table ----------
function DimensionsTable({ data, selected, onSelect }) {
  const [sort, setSort] = useState("priority");

  const sorted = useMemo(() => {
    const arr = [...data.dimensions];
    if (sort === "priority") arr.sort((a, b) => a.priority - b.priority);
    if (sort === "score") arr.sort((a, b) => a.score - b.score);
    if (sort === "weight") arr.sort((a, b) => b.weight - a.weight);
    return arr;
  }, [data, sort]);

  return (
    <section>
      <div className="sec-title">
        <div>
          <div className="eyebrow">SECCIÓN 03 · DIMENSIONES</div>
          <h2>Resumen por dimensión</h2>
          <p>8 dimensiones, 37 ítems · evaluación 360° · haz clic en una fila para enfocar su plan.</p>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ color: "var(--ink-3)", fontSize: 13 }}>
            <strong style={{ color: "var(--ink)" }}>8 dimensiones</strong> ordenadas por{" "}
            <span style={{ color: "var(--ink)" }}>
              {sort === "priority" ? "prioridad" : sort === "score" ? "score ascendente" : "peso"}
            </span>
          </div>
          <div className="seg">
            <button className={sort === "priority" ? "on" : ""} onClick={() => setSort("priority")}>Prioridad</button>
            <button className={sort === "score" ? "on" : ""} onClick={() => setSort("score")}>Score</button>
            <button className={sort === "weight" ? "on" : ""} onClick={() => setSort("weight")}>Peso</button>
          </div>
        </div>
        <table className="dim-table">
          <thead>
            <tr>
              <th style={{ width: "40%" }}>Dimensión</th>
              <th>Score</th>
              <th>Nivel</th>
              <th>Peso</th>
              <th>Plazo</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(d => {
              const s = LEVEL_STYLES[d.level];
              const isSel = selected === d.code;
              return (
                <tr key={d.code} className={isSel ? "selected" : ""} onClick={() => onSelect(d.code)}>
                  <td>
                    <span className="dim-code">{d.code}</span>
                    <span className="dim-name">{d.name}</span>
                  </td>
                  <td>
                    <div className="score-cell">
                      <span className="score-num" style={{ color: s.fg }}>{d.score.toFixed(1)}</span>
                      <div className="score-bar">
                        <span style={{ width: `${d.score}%`, background: s.fg }} />
                      </div>
                    </div>
                  </td>
                  <td><LevelBadge level={d.level} size="sm" /></td>
                  <td className="weight-cell">
                    <span className="bar"><span style={{ width: `${(d.weight / 18) * 100}%` }} /></span>
                    {d.weight}%
                  </td>
                  <td className="plazo-cell">{d.plazo}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ---------- Plan card ----------
function PlanCard({ dim, plan, rank, highlighted }) {
  const s = LEVEL_STYLES[dim.level];
  return (
    <article
      className="plan-card"
      style={highlighted ? { boxShadow: "0 0 0 2px #4F46E5, 0 20px 48px rgba(79,70,229,0.12)" } : undefined}
    >
      <header className="plan-head">
        <div className="plan-head-top">
          <span className="pcode">{dim.code}</span>
          <span>PRIORIDAD</span>
          <span className="priority">#{rank} de 8</span>
        </div>
        <h3 className="plan-title">{dim.name}</h3>
        <div className="plan-meta">
          <LevelBadge level={dim.level} size="sm" />
          <span className="pill plazo" style={{ background: s.bg, color: s.fg }}>
            {Icon.clock} {dim.plazo}
          </span>
          <span className="pill">Score {dim.score.toFixed(1)}</span>
          <span className="pill">Peso {dim.weight}%</span>
        </div>
      </header>

      <div className="plan-body">
        <div className="role-block">
          <div className="role-head">
            <span className="role-icon supervisor">SV</span>
            <span className="role-title">Acciones para el Supervisor</span>
            <span className="role-sub">{plan.supervisor.length} acciones</span>
          </div>
          <ul className="role-list supervisor">
            {plan.supervisor.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>

        <div className="role-block">
          <div className="role-head">
            <span className="role-icon jefe">JD</span>
            <span className="role-title">Acciones para el Jefe Directo</span>
            <span className="role-sub">{plan.jefe.length} acciones</span>
          </div>
          <ul className="role-list jefe">
            {plan.jefe.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>

        <div className="role-block">
          <div className="role-head">
            <span className="role-icon sistema">SI</span>
            <span className="role-title">Acciones para el Sistema / Organización</span>
            <span className="role-sub">{plan.sistema.length} acciones</span>
          </div>
          <ul className="role-list sistema">
            {plan.sistema.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      </div>

      <footer className="plan-foot">
        <div className="kpi-label">{Icon.kpi} Indicadores de seguimiento</div>
        <div className="kpi-list">
          {plan.kpis.map((k, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>·</span>}
              {k}
            </React.Fragment>
          ))}
        </div>
      </footer>
    </article>
  );
}

// ---------- Footer ----------
function PageFooter() {
  return (
    <footer className="page-footer">
      <div>
        <h5>Soporte</h5>
        <p><a href="#">soporte@talentha.io</a><br/>+57 (1) 555 0199<br/>Lun–Vie · 7:00–19:00 COT</p>
      </div>
      <div>
        <h5>Documentos</h5>
        <p>
          <a href="#">Guía del evaluador</a><br/>
          <a href="#">Diccionario de dimensiones</a><br/>
          <a href="#">Baremos LATAM 2026</a>
        </p>
      </div>
      <div className="copyright">
        <span>© 2026 Talentha · Analítica predictiva de seguridad industrial</span>
        <span>IPRA v2.4 · Confidencial</span>
      </div>
    </footer>
  );
}

// ---------- App ----------
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "cómoda",
  "accent": "#14B8A6",
  "heroVariant": "indigo",
  "showKpiStrip": true,
  "planCols": 2,
  "sortDefault": "priority"
}/*EDITMODE-END*/;

function App() {
  const data = window.IPRA_DATA;
  const [active, setActive] = useState("plans");
  const [selected, setSelected] = useState("D4");
  const [tweaks, setTweaks] = window.useTweaks
    ? window.useTweaks(TWEAK_DEFAULTS)
    : [TWEAK_DEFAULTS, () => {}];

  // Apply accent live
  React.useEffect(() => {
    document.documentElement.style.setProperty("--teal", tweaks.accent);
  }, [tweaks.accent]);

  // Hero background variants
  const heroBg = {
    indigo: "#1E1B4B",
    deepPurple: "#3B0764",
    slate: "#0F172A",
    teal: "#115E59",
  }[tweaks.heroVariant] || "#1E1B4B";

  React.useEffect(() => {
    document.querySelectorAll(".hero").forEach(el => {
      el.style.background = heroBg;
    });
  }, [heroBg]);

  const priorityPlans = useMemo(() => {
    return data.dimensions
      .filter(d => ["D4", "D1", "D3", "D2"].includes(d.code))
      .sort((a, b) => a.priority - b.priority);
  }, [data]);

  const density = tweaks.density === "compacta" ? { padding: "20px 40px 40px" } : {};

  return (
    <div className="app" data-density={tweaks.density}>
      <Nav active={active} onNav={setActive} />
      <main className="main">
        <Topbar onExport={() => window.print()} />
        <div className="page" style={density}>
          <Hero data={data} />
          {tweaks.showKpiStrip && <KpiStrip data={data} />}
          <DimensionsTable data={data} selected={selected} onSelect={setSelected} />

          <section style={{ marginTop: 44 }}>
            <div className="sec-title">
              <div>
                <div className="eyebrow">SECCIÓN 04 · INTERVENCIÓN</div>
                <h2>Planes detallados · top 4 prioridades</h2>
                <p>Intervención estructurada por rol. Las 4 dimensiones con mayor impacto ponderado sobre el IPRA Global.</p>
              </div>
              <button className="btn ghost">Ver las 8 dimensiones →</button>
            </div>

            <div
              className="plans"
              style={{ gridTemplateColumns: `repeat(${tweaks.planCols || 2}, minmax(0, 1fr))` }}
            >
              {priorityPlans.map((d, i) => (
                <PlanCard
                  key={d.code}
                  dim={d}
                  plan={data.plans[d.code]}
                  rank={i + 1}
                  highlighted={selected === d.code}
                />
              ))}
            </div>
          </section>

          <PageFooter />
        </div>
      </main>

      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection title="Layout">
            <window.TweakRadio
              label="Densidad"
              value={tweaks.density}
              options={["cómoda", "compacta"]}
              onChange={(v) => setTweaks({ density: v })}
            />
            <window.TweakSelect
              label="Columnas de planes"
              value={String(tweaks.planCols)}
              options={[{ value: "1", label: "1 columna" }, { value: "2", label: "2 columnas" }]}
              onChange={(v) => setTweaks({ planCols: Number(v) })}
            />
            <window.TweakToggle
              label="Mostrar KPIs ejecutivos"
              value={tweaks.showKpiStrip}
              onChange={(v) => setTweaks({ showKpiStrip: v })}
            />
          </window.TweakSection>

          <window.TweakSection title="Visual">
            <window.TweakRadio
              label="Fondo del hero"
              value={tweaks.heroVariant}
              options={["indigo", "deepPurple", "slate", "teal"]}
              onChange={(v) => setTweaks({ heroVariant: v })}
            />
            <window.TweakColor
              label="Color de acento"
              value={tweaks.accent}
              onChange={(v) => setTweaks({ accent: v })}
            />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
