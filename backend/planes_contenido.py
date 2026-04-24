"""
Repositorio de contenido para los planes de intervención IPRA.

PLAN_CONTENT mapea (id_dimensión, nivel) → dict con claves:
  supervisor : list[str]  – acciones para el supervisor directo
  manager    : list[str]  – acciones para el jefe del área
  system     : list[str]  – acciones sistémicas / organizacionales
  kpis       : list[str]  – indicadores clave de seguimiento
"""

PLAN_CONTENT = {
    ("D4", "critical"): {
        "supervisor": [
            "Realizar al menos 2 recorridos diarios por el área identificando condiciones inseguras y documentando en bitácora física o digital.",
            "Detener inmediatamente cualquier tarea donde el trabajador no cuente con los EPP requeridos o donde las condiciones del entorno representen riesgo inminente, sin importar el impacto en productividad.",
            "Facilitar una reunión de 5 minutos al inicio de cada turno para repasar los riesgos del día y reforzar el derecho y la obligación de detener trabajos inseguros.",
            "Reconocer públicamente a cada trabajador que ejerza el Stop Work correctamente, reforzando la conducta positiva ante el equipo.",
            "Registrar cada evento de detención en el formato corporativo indicando causa, acción tomada y resolución, y compartirlo con el jefe directo en las primeras 2 horas.",
        ],
        "manager": [
            "Revisar semanalmente el registro de eventos Stop Work del supervisor y dar retroalimentación formal sobre la calidad de la respuesta y documentación.",
            "Garantizar que el supervisor cuente con autoridad real y respaldo gerencial para detener operaciones sin presión de cumplimiento de metas productivas.",
            "Incluir el indicador de eventos Stop Work ejercidos como variable positiva en la evaluación de desempeño mensual del supervisor.",
            "Realizar una sesión de acompañamiento en campo mínimo una vez por semana para observar y reforzar la conducta del supervisor frente a condiciones inseguras.",
        ],
        "system": [
            "Implementar un protocolo documentado de Stop Work con definición clara de criterios de activación, pasos de actuación y responsables, disponible físicamente en el área.",
            "Garantizar que todos los trabajadores del área reciban capacitación formal (mínimo 2 horas) sobre el derecho y el deber de detener trabajos inseguros, con firma de asistencia.",
            "Crear un canal de reporte anónimo para que los trabajadores puedan escalar situaciones donde el Stop Work no fue ejercido o fue ignorado.",
            "Revisar los últimos 6 meses de incidentes del área para identificar si hubo señales previas no atendidas que debieron activar un Stop Work.",
        ],
        "kpis": [
            "Número de eventos Stop Work registrados por semana",
            "% de eventos con cierre documentado en < 2 horas",
            "Número de trabajadores que ejercieron Stop Work en el período",
            "% de recorridos de seguridad realizados vs programados",
            "Tiempo promedio de resolución por evento Stop Work",
        ],
    },
    ("D1", "critical"): {
        "supervisor": [
            "Verificar al inicio de cada turno que los controles críticos del área (barreras físicas, enclavamientos, señalización, permisos de trabajo) estén operativos y registrar el resultado en lista de chequeo.",
            "Identificar y reportar de inmediato cualquier control crítico degradado o ausente al jefe directo, sin esperar el reporte periódico.",
            "No autorizar el inicio de ninguna tarea de alto riesgo si los controles críticos asociados no están en condición verificada y operativa.",
            "Liderar una inspección semanal de condiciones del área con participación de al menos un trabajador del equipo, rotando quién acompaña cada semana.",
            "Documentar y escalar toda condición subestándar identificada en el formato correspondiente con fotografía, descripción y acción inmediata tomada.",
        ],
        "manager": [
            "Auditar mensualmente las listas de chequeo de controles críticos del supervisor y verificar que los registros sean consistentes con las condiciones reales del área.",
            "Gestionar con mantenimiento y la gerencia técnica la corrección de controles críticos degradados en plazos máximos de 24 horas para riesgos inmediatos y 72 horas para riesgos latentes.",
            "Definir junto con el área de HSE el inventario actualizado de controles críticos del área y asegurarse de que el supervisor lo conozca y tenga acceso a él.",
            "Revisar con el supervisor los resultados de las inspecciones semanales y priorizar acciones correctivas en conjunto.",
        ],
        "system": [
            "Actualizar y publicar el mapa de controles críticos por área con responsables, frecuencia de verificación y criterios de falla, accesible para supervisores y operarios.",
            "Establecer un sistema de alertas tempranas (digital o físico) que notifique automáticamente al jefe directo y al área de HSE cuando un control crítico sea reportado como degradado.",
            "Incluir la verificación de controles críticos como ítem obligatorio en las auditorías internas de seguridad con frecuencia mínima mensual.",
            "Revisar el historial de incidentes y casi-accidentes del área asociados a falla de controles críticos para identificar patrones recurrentes y rediseñar los controles si es necesario.",
        ],
        "kpis": [
            "% de listas de chequeo de controles críticos completadas diariamente",
            "Número de controles críticos degradados identificados por semana",
            "Tiempo promedio de corrección de controles críticos reportados",
            "% de inspecciones semanales realizadas con participación del equipo",
            "Número de tareas de alto riesgo detenidas por control crítico no verificado",
        ],
    },
}
