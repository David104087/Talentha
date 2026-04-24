/* global React, ReactDOM */
const { useState, useMemo, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#2DD4BF",
  "heroBg": "indigo",
  "density": "cómoda",
  "showMiniBars": true,
  "showSummaryStrip": true,
  "criticalThreshold": 40,
  "altoThreshold": 60,
  "moderadoThreshold": 75,
  "userName": "Carolina Mejía",
  "userRole": "Analista HSE",
  "userInitials": "CM"
} /*EDITMODE-END*/;

const SUPERVISOR = {
  nombre: "Sofía Moreno",
  cargo: "Coordinador de Operaciones",
  site: "Planta Norte · Manufactura",
  id: "SUP-00247",
  evaluators: 12,
  period: "Q1 2026"
};

const DIMENSIONES_BASE = [
{ id: "D1", nombre: "Controles Críticos y Condiciones del Área", peso: 16, score: 36.4 },
{ id: "D2", nombre: "Planeación y Arranque Seguro del Trabajo", peso: 13, score: 32.5 },
{ id: "D3", nombre: "Cumplimiento y Exigencia de Reglas", peso: 14, score: 36.4 },
{ id: "D4", nombre: "Detención de Trabajos Inseguros (Stop Work)", peso: 18, score: 32.5 },
{ id: "D5", nombre: "Aprendizaje de Incidentes", peso: 11, score: 32.5 },
{ id: "D6", nombre: "Participación y Clima de Seguridad", peso: 9, score: 32.5 },
{ id: "D7", nombre: "Liderazgo Visible y Coherente", peso: 12, score: 68.0 },
{ id: "D8", nombre: "Gestión de Fatiga y Factores Humanos", peso: 7, score: 82.0 }];


const LEVEL = {
  "Crítico": { bg: "#FFF1F2", fg: "#7F1D1D", ring: "#FCA5A5" },
  "Alto": { bg: "#FFFBEB", fg: "#B45309", ring: "#FCD34D" },
  "Moderado": { bg: "#FEF9E7", fg: "#D97706", ring: "#FDE68A" },
  "Bajo": { bg: "#ECFDF5", fg: "#059669", ring: "#A7F3D0" }
};

function levelFor(score, thresholds) {
  const t = thresholds || { crit: 40, alto: 60, mod: 75 };
  if (score < t.crit) return "Crítico";
  if (score < t.alto) return "Alto";
  if (score < t.mod) return "Moderado";
  return "Bajo";
}
function plazoFor(level) {
  return level === "Crítico" ? "0–15 días" :
  level === "Alto" ? "15–30 días" :
  level === "Moderado" ? "30–60 días" :
  "Sostenimiento";
}

function LevelBadge({ level }) {
  const s = LEVEL[level];
  return (
    <span className="level-badge" style={{ background: s.bg, color: s.fg, boxShadow: `inset 0 0 0 1px ${s.ring}55` }}>
      <span className="bullet" /> {level}
    </span>);

}

function Row({ d, onChange, onReset, error, thresholds, showMiniBars }) {
  const level = levelFor(d.score, thresholds);
  const s = LEVEL[level];
  return (
    <tr className={error ? "error" : ""}>
      <td>
        <span className="dim-code">{d.id}</span>
        <span className="dim-name">{d.nombre}</span>
      </td>
      <td className="input-cell">
        <div className="num-field">
          <input
            type="number" min="0" max="100" step="0.1"
            value={d.score}
            onChange={(e) => onChange({ score: e.target.value === "" ? "" : Number(e.target.value) })}
            aria-label={`Score ${d.id}`} />
          
          <span className="unit">/ 100</span>
        </div>
        {showMiniBars && <div className="mini-bar">
          <span style={{ width: `${Math.max(0, Math.min(100, d.score || 0))}%`, background: s.fg }} />
        </div>}
      </td>
      <td><LevelBadge level={level} /></td>
      <td className="input-cell">
        <div className="num-field sm">
          <input
            type="number" min="0" max="100" step="1"
            value={d.peso}
            onChange={(e) => onChange({ peso: e.target.value === "" ? "" : Number(e.target.value) })}
            aria-label={`Peso ${d.id}`} />
          
          <span className="unit">%</span>
        </div>
      </td>
      <td className="plazo-cell">{plazoFor(level)}</td>
      <td className="row-action">
        <button className="btn ghost sm" onClick={onReset} title="Restablecer al valor original">↺</button>
      </td>
    </tr>);

}

function App() {
  const [dims, setDims] = useState(DIMENSIONES_BASE.map((d) => ({ ...d })));
  const [submitted, setSubmitted] = useState(false);
  const [flash, setFlash] = useState(null);

  const [tweaks, setTweaks] = window.useTweaks ?
  window.useTweaks(TWEAK_DEFAULTS) :
  [TWEAK_DEFAULTS, () => {}];

  const thresholds = {
    crit: tweaks.criticalThreshold,
    alto: tweaks.altoThreshold,
    mod: tweaks.moderadoThreshold
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--teal", tweaks.accent);
  }, [tweaks.accent]);

  const heroGradient = {
    indigo: "linear-gradient(135deg, #1E1B4B 0%, #3B2B7A 100%)",
    deep: "linear-gradient(135deg, #0F0D2E 0%, #2D2A6E 100%)",
    teal: "linear-gradient(135deg, #115E59 0%, #0D9488 100%)",
    slate: "linear-gradient(135deg, #0F172A 0%, #334155 100%)"
  }[tweaks.heroBg] || "linear-gradient(135deg, #1E1B4B 0%, #3B2B7A 100%)";

  const totalPeso = useMemo(
    () => dims.reduce((s, d) => s + (Number(d.peso) || 0), 0),
    [dims]
  );
  const ipra = useMemo(() => {
    const tp = totalPeso || 1;
    return dims.reduce((s, d) => s + (Number(d.score) || 0) * (Number(d.peso) || 0), 0) / tp;
  }, [dims, totalPeso]);
  const globalLevel = levelFor(ipra, thresholds);

  const critCount = dims.filter((d) => levelFor(d.score, thresholds) === "Crítico").length;

  const errors = useMemo(() => {
    const errs = {};
    dims.forEach((d) => {
      if (d.score === "" || d.score < 0 || d.score > 100) errs[d.id + "_score"] = true;
      if (d.peso === "" || d.peso < 0 || d.peso > 100) errs[d.id + "_peso"] = true;
    });
    if (Math.abs(totalPeso - 100) > 0.5) errs.total = true;
    return errs;
  }, [dims, totalPeso]);

  const hasRowError = (id) => errors[id + "_score"] || errors[id + "_peso"];
  const isValid = Object.keys(errors).length === 0;

  function updateDim(idx, patch) {
    setDims((prev) => prev.map((d, i) => i === idx ? { ...d, ...patch } : d));
  }
  function resetRow(idx) {
    const base = DIMENSIONES_BASE[idx];
    setDims((prev) => prev.map((d, i) => i === idx ? { ...base } : d));
  }
  function resetAll() {
    setDims(DIMENSIONES_BASE.map((d) => ({ ...d })));
    setFlash({ kind: "info", text: "Valores restablecidos al dataset de prueba." });
    setTimeout(() => setFlash(null), 2500);
  }
  function distributeWeights() {
    const even = Math.round(100 / dims.length * 10) / 10;
    setDims((prev) => prev.map((d) => ({ ...d, peso: even })));
  }
  function submit() {
    if (!isValid) {
      setSubmitted(true);
      setFlash({ kind: "error", text: "Revisa los campos marcados — los pesos deben sumar 100%." });
      setTimeout(() => setFlash(null), 3000);
      return;
    }
    setSubmitted(true);
    setFlash({ kind: "success", text: "Plan IPRA generado. Abriendo reporte…" });
    setTimeout(() => {window.location.href = "Plan de Intervencion IPRA.html";}, 900);
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <img src="assets/talentha-mark.png" alt="" className="brand-mark-img" />
          <div>
            <div className="brand-name" style={{ fontFamily: "Raleway" }}>Talentha</div>
            <div className="brand-sub">IPRA · Generador de planes</div>
          </div>
        </div>
        <nav className="top-nav">
          <a className="top-link">Supervisores</a>
          <a className="top-link active">Nuevo plan</a>
          <a className="top-link">Reportes</a>
        </nav>
        <div className="top-user" style={{ width: "667.594px", alignItems: "flex-end", backgroundPosition: "right center", display: "none" }}>
          <div className="u-text">
            <div className="u-name">{tweaks.userName}</div>
            <div className="u-sub">{tweaks.userRole}</div>
          </div>
          <div className="avatar-photo" aria-hidden="true">
            <span>{tweaks.userInitials}</span>
          </div>
        </div>
      </header>

      <main className="page">
        <div className="breadcrumb">
          <span>Panel</span><span className="sep">/</span>
          <span>Supervisores</span><span className="sep">/</span>
          <strong>{SUPERVISOR.nombre}</strong><span className="sep">/</span>
          <span className="muted">Nuevo plan IPRA</span>
        </div>

        <section className="hero" style={{ background: heroGradient }}>
          <div>
            <div className="eyebrow">PASO 2 DE 3 · INGRESO DE SCORES</div>
            <h1>Ingresa el <em>peso</em> y el <em>score</em> de cada dimensión</h1>
            <p className="sub">
              El supervisor ya está registrado. Completa únicamente los valores numéricos
              por dimensión — los nombres y la estructura 360° se mantienen fijos por metodología.
            </p>
          </div>

          <div className="supervisor-card">
            <div className="who-row">
              <div className="avatar-lg">SM</div>
              <div>
                <div className="who-name">{SUPERVISOR.nombre}</div>
                <div className="who-meta">{SUPERVISOR.cargo}</div>
                <div className="who-meta">{SUPERVISOR.site}</div>
                <div className="who-id">{SUPERVISOR.id} · {SUPERVISOR.period}</div>
              </div>
            </div>
            <div className="who-stats">
              <div><span>{SUPERVISOR.evaluators}</span><small>Evaluadores 360°</small></div>
              <div><span>8</span><small>Dimensiones</small></div>
              <div><span>37</span><small>Ítems</small></div>
            </div>
          </div>
        </section>

        {flash && <div className={"flash " + flash.kind}>{flash.text}</div>}

        {tweaks.showSummaryStrip && false && <section className="summary-strip">
          <div className="ss">
            <div className="ss-label">IPRA Global (preview)</div>
            <div className="ss-value" style={{ color: LEVEL[globalLevel].fg }}>
              {ipra.toFixed(1)}
            </div>
            <LevelBadge level={globalLevel} />
          </div>
          <div className="ss">
            <div className="ss-label">Dimensiones críticas</div>
            <div className="ss-value">{critCount}<small>/8</small></div>
            <div className="ss-foot">Se activa plan prioritario</div>
          </div>
          <div className="ss">
            <div className="ss-label">Suma de pesos</div>
            <div className="ss-value" style={{ color: Math.abs(totalPeso - 100) > 0.5 ? "#B91C1C" : "#059669" }}>
              {totalPeso}<small>%</small>
            </div>
            <div className="ss-foot">
              {Math.abs(totalPeso - 100) > 0.5 ?
              <span>Debe sumar 100% · <a onClick={distributeWeights}>distribuir</a></span> :
              "Ponderación válida"}
            </div>
          </div>
          <div className="ss">
            <div className="ss-label">Completitud</div>
            <div className="ss-value">100<small>%</small></div>
            <div className="ss-foot">Todos los campos rellenos</div>
          </div>
        </section>}

        <section className="form-card">
          <div className="form-toolbar">
            <div>
              <div className="eyebrow">DIMENSIONES IPRA · 8</div>
              <h2>Scores por dimensión</h2>
            </div>
            <div className="toolbar-actions">
              <button className="btn ghost" onClick={distributeWeights}>Distribuir pesos iguales</button>
              <button className="btn ghost" onClick={resetAll}>Restablecer</button>
            </div>
          </div>

          <table className="form-table">
            <thead>
              <tr>
                <th style={{ width: "34%" }}>Dimensión</th>
                <th>Score (0–100)</th>
                <th>Nivel</th>
                <th>Peso (%)</th>
                <th>Plazo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {dims.map((d, i) =>
              <Row
                key={d.id}
                d={d}
                error={submitted && hasRowError(d.id)}
                thresholds={thresholds}
                showMiniBars={tweaks.showMiniBars}
                onChange={(p) => updateDim(i, p)}
                onReset={() => resetRow(i)} />

              )}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Totales</strong></td>
                <td className="muted">Promedio ponderado: <strong style={{ color: LEVEL[globalLevel].fg }}>{ipra.toFixed(1)}</strong></td>
                <td><LevelBadge level={globalLevel} /></td>
                <td>
                  <strong style={{ color: Math.abs(totalPeso - 100) > 0.5 ? "#B91C1C" : "#059669" }}>
                    {totalPeso}%
                  </strong>
                </td>
                <td colSpan="2" className="muted">
                  {Math.abs(totalPeso - 100) > 0.5 ? "⚠ Los pesos deben sumar exactamente 100%" : "✓ Listo para generar"}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>

        <div className="form-footer">
          <div className="actions" style={{ marginLeft: "auto" }}>
            <button className="btn ghost" onClick={() => history.back()}>← Cancelar</button>
            <button className="btn primary" onClick={submit} disabled={!isValid && submitted}>
              Generar plan IPRA →
            </button>
          </div>
        </div>
      </main>

      {window.TweaksPanel &&
      <window.TweaksPanel title="Tweaks">
          <window.TweakSection title="Usuario (header)">
            <window.TweakText
            label="Nombre"
            value={tweaks.userName}
            onChange={(v) => setTweaks({ userName: v })} />
          
            <window.TweakText
            label="Cargo"
            value={tweaks.userRole}
            onChange={(v) => setTweaks({ userRole: v })} />
          
            <window.TweakText
            label="Iniciales avatar"
            value={tweaks.userInitials}
            onChange={(v) => setTweaks({ userInitials: v.toUpperCase().slice(0, 2) })} />
          
          </window.TweakSection>

          <window.TweakSection title="Visual">
            <window.TweakRadio
            label="Fondo del hero"
            value={tweaks.heroBg}
            options={["indigo", "deep", "teal", "slate"]}
            onChange={(v) => setTweaks({ heroBg: v })} />
          
            <window.TweakColor
            label="Acento (teal)"
            value={tweaks.accent}
            onChange={(v) => setTweaks({ accent: v })} />
          
            <window.TweakToggle
            label="Mostrar mini barras por fila"
            value={tweaks.showMiniBars}
            onChange={(v) => setTweaks({ showMiniBars: v })} />
          
            <window.TweakToggle
            label="Mostrar tira de resumen"
            value={tweaks.showSummaryStrip}
            onChange={(v) => setTweaks({ showSummaryStrip: v })} />
          
          </window.TweakSection>

          <window.TweakSection title="Umbrales de semáforo">
            <window.TweakSlider
            label="Crítico <"
            value={tweaks.criticalThreshold}
            min={20} max={50} step={1}
            onChange={(v) => setTweaks({ criticalThreshold: v })} />
          
            <window.TweakSlider
            label="Alto <"
            value={tweaks.altoThreshold}
            min={40} max={75} step={1}
            onChange={(v) => setTweaks({ altoThreshold: v })} />
          
            <window.TweakSlider
            label="Moderado <"
            value={tweaks.moderadoThreshold}
            min={60} max={90} step={1}
            onChange={(v) => setTweaks({ moderadoThreshold: v })} />
          
          </window.TweakSection>
        </window.TweaksPanel>
      }
    </div>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);