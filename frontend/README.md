# Motor de Reglas — Frontend (Inmobiliaria)

Dashboard en React + Vite para registrar clientes, solicitudes y procesos
inmobiliarios, y evaluarlos contra el motor de reglas del backend (FastAPI).

## Cómo correrlo

```bash
npm install
npm run dev
```


## Simulación de autenticación

Cada vez que cambias de sección en el sidebar, aparece un overlay modal
("Autenticando usuario") durante 3 segundos antes de mostrar la nueva
pantalla. Es puramente decorativo/simulado (no llama a ningún endpoint
de auth real); vive en `src/components/AuthOverlay.jsx` y se dispara
desde `App.jsx`. Si más adelante el backend agrega autenticación real,
este es el lugar natural para conectarla.

## Estructura

```
src/
  api/            Llamadas HTTP, un archivo por recurso del backend
    clientes.js      POST /clientes
    solicitudes.js   POST /solicitudes
    procesos.js      POST /procesos
    evaluacion.js    POST /evaluate
  components/
    Sidebar.jsx     Navegación entre secciones
    Toast.jsx       Notificaciones de éxito / error
    Loading.jsx     Estado de carga reutilizable
    AuthOverlay.jsx Simulación de autenticación al cambiar de sección
  pages/
    ClientesPage.jsx       Sección 1: registrar cliente
    SolicitudesPage.jsx    Sección 2: radicar solicitud (requiere id_cliente)
    ProcesosPage.jsx       Sección 3: crear proceso (requiere id_solicitud)
    EvaluacionPage.jsx     Sección 4: evaluar proceso (requiere id_proceso)
```

## Flujo de uso

1. **Clientes** — crea un cliente y copia el `id_cliente` retornado.
2. **Solicitudes** — radica una solicitud usando ese `id_cliente`, copia el
   `id_solicitud` retornado.
3. **Procesos** — crea el proceso usando ese `id_solicitud`, copia el
   `id_proceso` retornado.
4. **Evaluación** — evalúa el proceso indicando su `id_proceso` y los
   mismos datos financieros (ingresos del cliente y valor del canon) con
   los que se creó, junto con los checks de estado.

