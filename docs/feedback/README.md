# Cómo entra el feedback de diseño

Beatriz revisa el sitio y manda los cambios por WhatsApp: capturas anotadas, notas de voz
transcritas, PDFs. Antes eso había que interpretarlo cada vez desde cero. Ahora se destila
a [`beatriz.md`](beatriz.md), que es la única lista con la que se trabaja y se le responde.

## El ciclo

1. **Ella manda.** WhatsApp, como siempre. No cambia nada por su lado.
2. **Robert vuelca el crudo** en `X:\Proyectos\_material\candela-cafe\feedback\<AAAA-MM-DD>\`:
   capturas sueltas, o el chat exportado con *Exportar chat → Sin archivos*, o el PDF.
   También vale pegar las capturas en la sesión: se guardan ahí antes de nada.
3. **Robert escribe `/beatriz`** en la sesión. Se destila el lote a la tabla y se commitea.
4. **Al cerrar cada punto**, `/beatriz done B-01` lo marca hecho con el commit que lo resuelve.
5. **`/beatriz responder`** genera el mensaje de vuelta con las dudas y lo cerrado.

## Por qué el crudo no entra al repo

Un export de WhatsApp es la conversación entera: números, mensajes personales, cosas que
no son de Candela. Lo que se commitea queda en GitHub para siempre. Por eso el `.txt` y las
capturas se quedan en `_material\`, que ya es la convención para lo que no es repo, y aquí
solo llega el destilado.

## Qué hace útil a `beatriz.md`

- **Los descartados llevan motivo.** Lo que hoy hay que reexplicar cada vez queda escrito una
  sola vez.
- **La sección *Para preguntarle*** agrupa las ambigüedades en un solo mensaje en vez de
  cinco idas y vueltas.
- **La columna *Cierre*** apunta al commit. Cuando pregunta si algo está hecho, la respuesta
  está en la tabla.
- **Los IDs son estables** (`B-01`, `B-02`…). Se puede hablar de "el B-01" con ella y con
  Robert sin describir el cambio otra vez.

## Reglas de destilado

- Entra **solo lo que es una petición de cambio**. El resto de la conversación se queda fuera.
- Se conserva su palabra literal cuando es la que define el cambio; no se "traduce" a jerga
  técnica lo que ella dijo de otra forma.
- Lo ambiguo **no se adivina**: va a *Para preguntarle* con el punto abierto.
- Si una petición choca con una decisión anterior de Robert, va a *Para decidir con Robert*
  con la decisión que contradice. No se resuelve por cuenta propia.
- Lo durable que se acuerde (una decisión de diseño, no una tarea) se sube al brain, a
  `clientes/candela-cafe.md`.
- Lo accionable por Robert que no sea código va a `galiax-pendientes`, solo la línea: el
  detalle se queda aquí y no se duplica.
