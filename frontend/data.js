// IPRA sample data
window.IPRA_DATA = {
  supervisor: {
    name: "Sofía Moreno",
    role: "Coordinador de Operaciones",
    site: "Planta Norte · Manufactura",
    id: "SUP-00247",
    evaluators: 12,
    reportDate: "23 de abril, 2026",
    period: "Q1 2026",
  },
  ipraGlobal: {
    score: 40.2,
    level: "Crítico",
    delta: -4.8,
    percentile: 12,
  },
  dimensions: [
    { code: "D4", name: "Detención de Trabajos Inseguros (Stop Work)", score: 32.5, level: "Crítico", weight: 18, plazo: "0–15 días", priority: 1 },
    { code: "D1", name: "Controles Críticos y Condiciones del Área", score: 36.4, level: "Crítico", weight: 16, plazo: "0–15 días", priority: 2 },
    { code: "D3", name: "Cumplimiento y Exigencia de Reglas", score: 36.4, level: "Crítico", weight: 14, plazo: "0–15 días", priority: 3 },
    { code: "D2", name: "Planeación y Arranque Seguro del Trabajo", score: 32.5, level: "Crítico", weight: 13, plazo: "0–15 días", priority: 4 },
    { code: "D7", name: "Liderazgo Visible y Coherente", score: 68.0, level: "Alto", weight: 12, plazo: "15–30 días", priority: 5 },
    { code: "D5", name: "Aprendizaje de Incidentes", score: 32.5, level: "Crítico", weight: 11, plazo: "0–15 días", priority: 6 },
    { code: "D6", name: "Participación y Clima de Seguridad", score: 32.5, level: "Crítico", weight: 9, plazo: "0–15 días", priority: 7 },
    { code: "D8", name: "Gestión de Fatiga y Factores Humanos", score: 82.0, level: "Moderado", weight: 7, plazo: "30–60 días", priority: 8 },
  ],
  plans: {
    D4: {
      supervisor: [
        "Implementar protocolo de Stop Work Authority en todas las operaciones",
        "Realizar reuniones diarias de 5 minutos sobre autoridad para detener trabajos",
        "Reconocer públicamente al menos 2 casos de detención preventiva por semana",
      ],
      jefe: [
        "Validar semanalmente que el supervisor esté ejerciendo autoridad de detención",
        "Proporcionar respaldo visible cuando se detengan trabajos inseguros",
      ],
      sistema: [
        "Crear canal anónimo de reporte de trabajos no detenidos",
        "Implementar badge de reconocimiento \"Stop Work Champion\"",
      ],
      kpis: ["N° de detenciones reportadas", "Tiempo promedio de respuesta", "% de trabajadores que conocen el procedimiento"],
    },
    D1: {
      supervisor: [
        "Realizar inspección de controles críticos al inicio de cada turno",
        "Documentar condiciones subestándar en formato digital",
        "No autorizar inicio de trabajo sin verificación de controles",
      ],
      jefe: [
        "Auditar 30% de las inspecciones del supervisor mensualmente",
        "Proveer recursos para corrección inmediata de hallazgos críticos",
      ],
      sistema: [
        "Digitalizar lista de verificación de controles críticos",
        "Establecer matriz de consecuencias por omisión de controles",
      ],
      kpis: ["% de controles verificados", "N° de condiciones críticas corregidas", "Tiempo de cierre de hallazgos"],
    },
    D3: {
      supervisor: [
        "Reforzar diariamente el cumplimiento de las 10 reglas que salvan vidas",
        "Aplicar consecuencias consistentes ante incumplimientos, sin excepciones jerárquicas",
        "Realizar observaciones conductuales de seguridad (BBS) 3 veces por semana",
      ],
      jefe: [
        "Modelar el cumplimiento de reglas en cada visita a planta",
        "Revisar mensualmente el registro de consecuencias aplicadas por el supervisor",
      ],
      sistema: [
        "Publicar matriz de consecuencias homologada por tipo de incumplimiento",
        "Implementar tablero digital de cumplimiento de reglas críticas por turno",
      ],
      kpis: ["% cumplimiento de reglas críticas", "N° de observaciones BBS realizadas", "Tasa de reincidencia"],
    },
    D2: {
      supervisor: [
        "Ejecutar Análisis de Trabajo Seguro (ATS) antes de tareas no rutinarias",
        "Liderar charla pre-operacional de 10 minutos con identificación de peligros",
        "Verificar EPP y permisos antes de autorizar el arranque",
      ],
      jefe: [
        "Auditar semanalmente la calidad de los ATS firmados por el supervisor",
        "Acompañar al menos un arranque de turno de alto riesgo por quincena",
      ],
      sistema: [
        "Digitalizar formato ATS con firma electrónica y geolocalización",
        "Incorporar alertas de permisos vencidos antes de iniciar trabajos",
      ],
      kpis: ["% tareas con ATS documentado", "N° de peligros identificados por ATS", "Tiempo de arranque seguro"],
    },
  },
};

// Semáforo mapping — EXACT per spec (do not change)
window.LEVEL_STYLES = {
  "Crítico":  { bg: "#FFF1F2", fg: "#7F1D1D", ring: "#FCA5A5", plazo: "0–15 días" },
  "Alto":     { bg: "#FFFBEB", fg: "#B45309", ring: "#FCD34D", plazo: "15–30 días" },
  "Moderado": { bg: "#FEF9E7", fg: "#D97706", ring: "#FDE68A", plazo: "30–60 días" },
  "Bajo":     { bg: "#ECFDF5", fg: "#059669", ring: "#A7F3D0", plazo: "Sostenimiento" },
};
