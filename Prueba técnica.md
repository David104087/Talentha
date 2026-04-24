# TALENTHA®

## Prueba Técnica — Desarrollador en Práctica

**Candidato:** ________________________________

| Campo | Valor |
|---|---|
| Duración | 3 días hábiles |
| Stack | React + Python |
| Entrega | GitHub + ZIP |
| Modalidad | Individual / remoto |

Talentha® · Mentoring Consultores SAS · Confidencial · Mayo 2026

---

# 1. Contexto del negocio

Talentha es una plataforma SaaS de analítica predictiva de seguridad industrial. Uno de sus productos principales es el IPRA (Índice Predictivo de Riesgo en Seguridad), una evaluación 360° que mide 8 dimensiones de liderazgo en seguridad en supervisores industriales.

Cada dimensión tiene un score de 0 a 100 y un semáforo:

| Rango | Nivel | Código | Plazo de intervención |
|---|---|---|---|
| 0 – 64 | Riesgo Crítico | `'critico'` | 0–15 días |
| 65 – 74 | Riesgo Alto | `'alto'` | 15–30 días |
| 75 – 84 | Riesgo Moderado | `'moderado'` | 30–60 días |
| ≥ 85 | Riesgo Bajo | `'bajo'` | Sostenimiento |

El sistema actualmente genera un informe PDF individual por supervisor. El objetivo de esta prueba es construir el componente de planes de intervención automatizados que se integrará en ese informe y en la plataforma web.

---

# 2. La prueba — qué debes construir

**Objetivo** — Implementar el motor de planes de intervención del IPRA: un sistema que, dado el score de cada dimensión de un supervisor, genera automáticamente el plan de acción personalizado con acciones concretas para 3 actores.

---

## 2.1 Parte 1 — Backend en Python

**Obligatoria**

Escribe una función Python llamada `generar_plan_intervencion` que reciba los scores de las 8 dimensiones de un supervisor y devuelva el plan de intervención estructurado.

### Input esperado

```python
scores = [
    {
        'id': 'D1',
        'nombre': 'Controles Críticos y Condiciones del Área',
        'peso': 16,
        'score': 36.4
    },
    {
        'id': 'D2',
        'nombre': 'Planeación y Arranque Seguro del Trabajo',
        'peso': 13,
        'score': 32.5
    },
    {
        'id': 'D3',
        'nombre': 'Cumplimiento y Exigencia de Reglas',
        'peso': 14,
        'score': 36.4
    },
    {
        'id': 'D4',
        'nombre': 'Detención de Trabajos Inseguros (Stop Work)',
        'peso': 18,
        'score': 32.5
    },
    {
        'id': 'D5',
        'nombre': 'Aprendizaje de Incidentes',
        'peso': 11,
        'score': 32.5
    },
    {
        'id': 'D6',
        'nombre': 'Participación y Clima de Seguridad',
        'peso': 9,
        'score': 32.5
    },
    {
        'id': 'D7',
        'nombre': 'Liderazgo Visible y Coherente',
        'peso': 12,
        'score': 68.0
    },
    {
        'id': 'D8',
        'nombre': 'Gestión de Fatiga y Factores Humanos',
        'peso': 7,
        'score': 82.0
    },
]
```

### Output esperado — estructura JSON

```json
{
  "supervisor": "Sofia Moreno",
  "ipra_global": 40.2,
  "resumen": [
    {
      "id": "D4",
      "nombre": "Detención de Trabajos Inseguros (Stop Work)",
      "score": 32.5,
      "peso": 18,
      "nivel": "critico",
      "plazo": "0-15 dias",
      "prioridad_orden": 1
    }
  ],
  "planes": [
    {
      "id": "D4",
      "nivel": "critico",
      "supervisor": ["Acción 1...", "Acción 2..."],
      "jefe": ["Acción 1..."],
      "sistema": ["Acción 1..."],
      "kpi": "Indicador 1 · Indicador 2"
    }
  ]
}
```

### Reglas de ordenamiento para `planes`

1. Primero las dimensiones en nivel `'critico'`, luego `'alto'`. Los niveles `'moderado'` y `'bajo'` no generan plan detallado.
2. Dentro del mismo nivel, ordenar por peso DESC, es decir, el de mayor peso va primero.
3. Máximo 4 dimensiones en `planes`. Si hay más, tomar las 4 de mayor prioridad.
4. El campo `ipra_global` se calcula como:

```txt
suma(score_i × peso_i / 100)
```

para todas las dimensiones.

### Contenido de los planes — texto de las acciones

Para esta prueba, **NO** esperamos que escribas los 32 planes completos.

Escribe el contenido real de los planes solo para:

- D4, Stop Work, en nivel `'critico'`
- D1, Controles Críticos, en nivel `'critico'`

Para el resto de dimensiones y niveles, puedes usar texto placeholder como:

```txt
Acción de intervención para [dim] en nivel [nivel] — actor [supervisor/jefe/sistema]
```

Lo que evaluamos es la estructura de datos, la lógica de selección/ordenamiento y la calidad del código, no que hayas escrito todos los textos.

### Requisitos técnicos Parte 1

- Función `generar_plan_intervencion(scores, nombre_supervisor)` en Python puro, sin dependencias externas.
- Función `get_semaforo(score)` que retorne el nivel correcto según los rangos de la tabla.
- Función `calcular_ipra_global(scores)` con la fórmula correcta.
- Tests unitarios para al menos:
  - `get_semaforo` con los 4 rangos.
  - `calcular_ipra_global` con un caso conocido.
  - El ordenamiento de dimensiones.
- Código limpio, con docstrings y nombres de variables descriptivos en español o inglés, pero consistente.

---

## 2.2 Parte 2 — Componente React

**Obligatoria**

Construye un componente React que reciba el output de la función Python, como prop o como JSON hardcodeado, y renderice el plan de intervención de forma visual.

El componente debe mostrar:

1. Una tabla resumen con las 8 dimensiones, su score, nivel con color de semáforo, peso y plazo.
2. Una sección de planes de intervención, máximo 4 dimensiones, donde cada una tiene 3 subsecciones:
   - `Para el supervisor`
   - `Para el jefe directo`
   - `Para el sistema / organización`
3. Un indicador del IPRA global con su nivel de semáforo y color correspondiente.

### Requisitos técnicos Parte 2

- React funcional con hooks: `useState`, `useMemo`.
- Sin librerías de UI externas. Solo CSS inline o CSS modules.
- Los colores del semáforo deben respetar exactamente los valores:

| Nivel | Fondo | Texto |
|---|---|---|
| Crítico | `#FFF1F2` | `#7F1D1D` |
| Alto | `#FFFBEB` | `#B45309` |
| Moderado | `#FEF9E7` | `#D97706` |
| Bajo | `#ECFDF5` | `#059669` |

- Diseño limpio y funcional. No se evalúa el diseño visual, sí la organización de la información.
- El componente debe recibir los datos vía props:

```jsx
<PlanIntervencion supervisor="Sofia Moreno" scores={[...]} />
```

---

## 2.3 Parte 3 — Pregunta de arquitectura

**Obligatoria**

Responde en máximo 15 líneas de texto:

La función `generar_plan_intervencion` está en el backend, Django/Python. El componente React está en el frontend.

Explica cómo conectarías estos dos en la plataforma real:

- ¿Qué endpoint crearías en Django?
- ¿Cuándo se llama?
- ¿Cómo lo consume React?
- ¿Qué datos guardarías en base de datos y cuáles no?

No hay una sola respuesta correcta. Evaluamos que pienses en la arquitectura completa, que identifiques qué vale la pena persistir y qué no, y que expliques tu razonamiento.

---

## 2.4 Parte 4 — Bonus

**Opcional, no excluyente**

Solo si quieres mostrar más:

- **Bonus A:** Escribe el endpoint Django REST Framework, `APIView` o `ViewSet`, que expone el plan de intervención. Puede ser pseudocódigo bien estructurado.
- **Bonus B:** Convierte la tabla resumen del componente React en un componente reutilizable `<TablaResumenIPRA />` con sus `propTypes` documentados.
- **Bonus C:** ¿Cómo manejarías el caso en que una dimensión tiene más del 50% de respuestas N/O de los evaluadores? ¿Esa dimensión entra al cálculo del IPRA global? Explica en 5 líneas.

---

# 3. Criterios de evaluación

| Criterio | Peso | Qué evaluamos |
|---|---:|---|
| Lógica y corrección — Python | 30% | La función produce el output correcto. El ordenamiento es correcto. Los tests pasan. |
| Calidad del código | 20% | Legible, organizado, sin código muerto. Nombres descriptivos. No hay lógica duplicada. |
| Componente React funcional | 25% | Renderiza correctamente. Props bien definidos. Colores de semáforo correctos. |
| Pensamiento arquitectural | 20% | Respuesta escrita coherente. Identifica qué persistir. Piensa en el sistema completo. |
| Bonus, si aplica | 5% | Calidad de los extras. No resta si no se entrega. |

---

## 3.1 Lo que NO evaluamos

- Que hayas escrito los 32 textos de planes, eso no es el objetivo.
- Que uses un framework de UI específico o que el diseño sea bonito.
- Que el código funcione en el entorno de Talentha. Evaluamos la lógica y la arquitectura.
- Velocidad. 3 días es suficiente para hacerlo bien.

---

## 3.2 Lo que SÍ importa mucho

- Que la lógica de `get_semaforo` y el ordenamiento sean exactamente correctos. Eso entra a producción.
- Que los tests cubran los casos borde:
  - score exactamente en 65
  - score exactamente en 75
  - score exactamente en 85
  - score en 0
  - score en 100
- Que el componente React refleje fielmente los datos:
  - colores correctos
  - orden correcto
  - máximo 4 planes
- Que la respuesta de arquitectura muestre que entiendes la diferencia entre lógica de negocio y persistencia.

---

# 4. Instrucciones de entrega

## 4.1 Estructura de carpetas esperada

```txt
prueba_talentha_deiner/
├── backend/
│   ├── plan_intervencion.py        # función principal + get_semaforo + calcular_ipra
│   ├── planes_contenido.py         # diccionario con textos de D4-critico y D1-critico
│   └── test_plan_intervencion.py   # tests unitarios
├── frontend/
│   ├── PlanIntervencion.jsx        # componente principal
│   ├── TablaResumenIPRA.jsx        # bonus B — opcional
│   └── index.html / App.jsx        # demo funcional, puede ser Create React App o Vite
├── arquitectura.md                 # respuesta a la pregunta de arquitectura, parte 3
└── README.md                       # cómo correr el proyecto localmente
```

---

## 4.2 Formato de entrega

1. Subir el código a un repositorio GitHub público o privado. En ese caso, dar acceso a `@talentha-tech`.
2. Enviar el link del repositorio + cualquier nota relevante al correo:

```txt
gerencia@mentoringconsultores.com
```

3. Asunto del correo:

```txt
Prueba técnica Talentha — Deiner Motta
```

4. Fecha límite: 3 días hábiles desde la fecha en que recibes este documento.

---

## 4.3 Dato de entrada para la prueba

Usa exactamente este JSON como input de prueba para tu función y tu componente React:

```python
SUPERVISOR_PRUEBA = {
    'nombre': 'Sofia Moreno',
    'cargo': 'Coordinador',
    'scores': [
        {
            'id': 'D1',
            'nombre': 'Controles Críticos y Condiciones del Área',
            'peso': 16,
            'score': 36.4
        },
        {
            'id': 'D2',
            'nombre': 'Planeación y Arranque Seguro del Trabajo',
            'peso': 13,
            'score': 32.5
        },
        {
            'id': 'D3',
            'nombre': 'Cumplimiento y Exigencia de Reglas',
            'peso': 14,
            'score': 36.4
        },
        {
            'id': 'D4',
            'nombre': 'Detención de Trabajos Inseguros (Stop Work)',
            'peso': 18,
            'score': 32.5
        },
        {
            'id': 'D5',
            'nombre': 'Aprendizaje de Incidentes',
            'peso': 11,
            'score': 32.5
        },
        {
            'id': 'D6',
            'nombre': 'Participación y Clima de Seguridad',
            'peso': 9,
            'score': 32.5
        },
        {
            'id': 'D7',
            'nombre': 'Liderazgo Visible y Coherente',
            'peso': 12,
            'score': 68.0
        },
        {
            'id': 'D8',
            'nombre': 'Gestión de Fatiga y Factores Humanos',
            'peso': 7,
            'score': 82.0
        },
    ]
}
```

---

### Resultado esperado con este input

| Verificar | Valor esperado | Por qué |
|---|---|---|
| IPRA global | 40.2 ±0.1 | D1×0.16 + D2×0.13 + ... + D8×0.07 = 40.2 |
| Planes generados | 4: D4, D1, D3, D2 — todas críticas | Solo hay 6 en crítico/alto; tomamos las 4 de mayor peso |
| Primera dimensión en planes | D4, Stop Work | Mayor peso, 18%, entre las críticas |
| Segunda dimensión en planes | D1, Controles Críticos | Peso 16%, segunda en orden |
| D7 en planes | Sí — nivel `'alto'`, 68.0 | 65 ≤ 68 < 75 → alto |
| D8 en planes | No — solo en resumen | 82 ≥ 75 → moderado, no genera plan detallado... wait |

---

## 4.4 Preguntas permitidas

Si tienes alguna duda técnica sobre el enunciado, puedes escribir al correo de entrega. Responderemos en el mismo día.

No se penaliza preguntar. Se penaliza no entregar o entregar sin intentar.

---

Talentha® · Prueba Técnica Desarrollador en Práctica · Mayo 2026 · Confidencial