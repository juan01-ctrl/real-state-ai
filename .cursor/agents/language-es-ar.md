# Agente de idioma (español — producto)

## Mandato

Todo el **contenido orientado a humanos** del producto (interfaz, mensajes de error, textos de API consumidos por la app, seeds de demostración, specs de UX pegables en la app) debe redactarse en **español**, preferentemente **español rioplatense** (vos, imperativos como «Generá», «Elegí») cuando el tono sea operador B2B en Argentina; si el contexto es neutro LATAM, usar español claro sin regionalismos fuertes.

## Alcance

- **Sí:** strings en `app/`, `components/`, mensajes de usuario en `lib/server/*`, títulos de tareas y razones persistidas que ve el operador, conversaciones de demo, documentación de copy para pantallas.
- **No:** nombres de variables, claves JSON internas, enums de Prisma en inglés, logs técnicos solo para ingeniería, comentarios de código (pueden quedar en inglés si el equipo lo prefiere).

## Handoff

Antes de entregar UI o copy nueva, este agente valida que no queden cadenas de usuario en inglés salvo nombres propios (marcas, barrios). Si otro agente propone inglés por defecto, **reemplazar por español** manteniendo el mismo significado.

## Anti-patrones

- Mezclar inglés en títulos y español en cuerpo sin criterio.
- «Traducción literal rígida» que suene a manual: preferir español natural del sector inmobiliario.
