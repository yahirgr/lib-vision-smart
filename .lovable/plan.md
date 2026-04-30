
# Mejoras UI/UX para Lib-Vision AI

Implementaré 7 mejoras manteniendo la estética verde institucional y respetando los tokens semánticos ya definidos en `index.css` (los modos claro/oscuro ya están parametrizados, solo falta exponer el toggle).

## 1. Modo Oscuro/Claro (toggle Sun/Moon)

- `next-themes` ya está instalado. Envolver `App.tsx` con `<ThemeProvider attribute="class" defaultTheme="system">`.
- Crear `src/components/ThemeToggle.tsx` con un botón ghost que alterna `light`/`dark` mostrando icono Sun o Moon (Lucide), con animación de rotación.
- Insertarlo en el header de `Index.tsx`, esquina superior derecha.
- Verificar contraste de tokens dark ya presentes (`--card`, `--border`, `--status-reserved-bg`). Ajustar `glass-cubicle` en `index.css` añadiendo variante `.dark .glass-cubicle` con `rgba(255,255,255,0.05)` y borde tenue para legibilidad.

## 2. Tooltips informativos en cubículos

- En `CubicleGrid.tsx`, envolver cada `CubicleButton` con `<Tooltip>` de `@/components/ui/tooltip` (el `TooltipProvider` ya está montado en `App.tsx`).
- Contenido del tooltip:
  - **Estado**: Libre / Ocupado / Reservado
  - **Tiempo**: usar helper `formatDuration(occupiedSince | reservedSince)` (extraer de `CubicleDetailDialog` a `src/lib/cubicle-utils.ts` para reutilizar)
  - **Personas detectadas**: `personDetected ? 1 : 0` de capacidad (`/{capacity}`)
  - **Objetos detectados**: lista corta cuando aplique
- `delayDuration={150}` para respuesta ágil.

## 3. Código QR por cubículo

- Añadir dependencia `qrcode.react` para generar SVG client-side (sin dependencias pesadas).
- En `CubicleButton`: icono `QrCode` (Lucide) tamaño `h-3 w-3` posicionado `absolute bottom-0.5 right-0.5` con `opacity-50 hover:opacity-100`. Click detiene propagación y abre nuevo modal.
- Crear `src/components/CubicleQRDialog.tsx`:
  - Muestra `<QRCodeSVG>` (256px) con valor `libvision://checkin/{cubicle.id}`.
  - Título "Check-in Cubículo #N", descripción, botón "Cerrar".
  - Estado controlado en `CubicleGrid` paralelo a `selected`.

## 4. Reloj en vivo en header

- Crear `src/components/LiveClock.tsx`: hook con `setInterval(1000)` + cleanup. Formato `es-MX`: `jue, 30 abr · 14:32:07` (24h). Memo del formatter.
- Insertar en el header de `Index.tsx` junto al indicador "Sistema activo".

## 5. Iconografía consistente

- Auditar todos los iconos para usar Lucide con `strokeWidth={2}` y tamaño armonizado (`h-4 w-4` cubículos, `h-3.5 w-3.5` badges, `h-5 w-5` headers).
- Reemplazar `Minus` (cubículo libre) por `Square` para coherencia conceptual con "espacio vacío".
- Mantener: `User` (ocupado), `Package` (reservado/objetos), `Lock` (privado), `QrCode` (check-in), `Sun`/`Moon` (tema), `AlertTriangle` (alertas).

## 6. Panel de Alertas Críticas

- Extender `useCubicleSimulation.ts` con detección de exceso de capacidad: cuando un cubículo `private` con `capacity=2` reciba simulación de "exceso" (nuevo modo en `simulateDetection`: `"overcapacity"`) o cuando un estándar (cap=1) tenga `personDetected && detectedObjects.length >= 3`, generar log con `type: "alert"` y mensaje `"Cubículo #N: Exceso de personas detectado"`.
- Exponer `criticalAlerts = logs.filter(l => l.type === "alert" && l.message.includes("Exceso"))` (últimas 5).
- Crear `src/components/CriticalAlertsPanel.tsx`: usa `Collapsible` (ya existe), header rojo con `AlertTriangle` y badge contador, contenido lista de alertas con timestamp.
- Añadirlo arriba del `AdminPanel` en el tab de administración.
- Adicional: disparar `toast.error(...)` (sonner) en tiempo real cuando aparece una nueva alerta crítica (efecto que compara longitud previa).

## 7. Refactor visual

- Cambiar `rounded-lg` → `rounded-xl` en: tarjetas de `AdminPanel`, `SimulationPanel`, `StatsBar`, `CubicleButton`, contenedores de filtros.
- Añadir `shadow-sm hover:shadow-md transition-all duration-300` a tarjetas.
- Wrappear el contenido del tab Estudiante con animación: `<div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300" key={floorFilter}>` para que al cambiar de planta haga transición fluida (la `key` fuerza el remount).
- Añadir `transition-colors duration-200` a botones de filtros.

## Detalles técnicos

**Archivos nuevos:**
- `src/components/ThemeToggle.tsx`
- `src/components/LiveClock.tsx`
- `src/components/CubicleQRDialog.tsx`
- `src/components/CriticalAlertsPanel.tsx`
- `src/lib/cubicle-utils.ts` (helper `formatDuration`)

**Archivos modificados:**
- `src/App.tsx` — envolver con `ThemeProvider` de next-themes
- `src/pages/Index.tsx` — header (toggle + reloj), animación tab estudiante, integrar alertas
- `src/components/CubicleGrid.tsx` — tooltips, icono QR, animación de transición
- `src/components/CubicleDetailDialog.tsx` — usar helper compartido
- `src/components/AdminPanel.tsx` — incluir `CriticalAlertsPanel`, rounded-xl, sombras
- `src/components/StatsBar.tsx`, `src/components/SimulationPanel.tsx` — rounded-xl + sombras
- `src/hooks/useCubicleSimulation.ts` — modo "overcapacity", lógica de alertas críticas, toast
- `src/index.css` — ajuste `glass-cubicle` para dark mode
- `package.json` — añadir `qrcode.react`

**Compatibilidad:** Todo trabaja sobre los tokens HSL existentes; no se introducen colores hardcoded. El `TooltipProvider` ya está montado globalmente así que los tooltips funcionan sin configuración extra.
