# Feedback de Beatriz — Candela y Café Market

Registro destilado de los cambios que Beatriz pide por WhatsApp. Cómo funciona:
[README.md](README.md). El crudo (capturas y exports) vive **fuera del repo**, en
`X:\Proyectos\_material\candela-cafe\feedback\<fecha>\`.

<!-- ultimo_lote_procesado: 2026-10-01 -->

## Cambios

| ID | Fecha | De | Dónde | Qué pide | Estado | Cierre |
|----|-------|----|-------|----------|--------|--------|
| B-01 | 10-01 | Beatriz | Portada · barra, hero y títulos de sección | "**Tiene varias tipografías**" (Robert). Sus flechas marcan cuatro textos en tres familias: «Candela & Café» de la barra y «Authentic Flavors!» (Architects Daughter, a mano), «MENU» (DM Sans) y «THE FAVORITES» (Anton). No dice cuáles quedarse | ✅ hecho | `c10d539` |

**B-01, lo que había en la web:** tres familias. **Architects Daughter** en el nombre de la
barra, el título del hero, los precios y las notas a mano (y la frase del pie); **Anton** en los
títulos de sección, los nombres de los platos y la FAQ; **DM Sans** en el texto, el menú y los
botones. «Authentic Flavors!» salía además en **negrita falsa** (Architects Daughter solo tiene
peso 400 y el navegador la engordaba).

**B-01, cómo quedó (1-oct, en producción):** **todo en DM Sans**, en portada, carta y privacidad.
Lo que iba a mano y los carteles pasan a DM Sans en negrita (700); la jerarquía la marcan el
peso y el tamaño. Se borraron Anton y Architects Daughter (−31 KB); las pruebas exigen una sola
`@font-face` y que toda declaración de fuente vaya a `var(--body)`. El logo redondo es imagen y
no cambia.

## Para preguntarle

- Nada pendiente.

## Decidido

- **B-01 → una sola tipografía, DM Sans (Robert, 10-01).** Chocaba con la «Carta de papel»
  (24-sep: carteles en Anton y precios a mano) y con el hero de fuego recuperado ese mismo día
  (título a mano del banner de Figma). Robert: "**debemos ser uniformes, no se pueden utilizar
  más de una tipografía. Mantengámonos con una solamente**". Eligió DM Sans entre dos maquetas
  (A · DM Sans, B · Archivo con carteles estrechos) por ser la más uniforme y la que ya cargaba
  la web.

## Crudo de este lote

- `_material\candela-cafe\feedback\2026-10-01\01-varias-tipografias.png` — dos capturas de
  WhatsApp de Beatriz (12:57) con flechas: barra + hero, y «THE FAVORITES».
