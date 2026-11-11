---
name: AgroDirecto
description: Del campo a tu negocio, sin tantos intermediarios.
colors:
  forest: "#123c2d"
  forest-deep: "#0a2d22"
  leaf: "#2c7a4b"
  leaf-light: "#4f9b68"
  harvest-gold: "#e9ad28"
  cream: "#f7f3e9"
  cream-deep: "#ede6d7"
  page: "#fbfcfa"
  white: "#ffffff"
  ink: "#1f2c27"
  muted: "#66736d"
  line: "#dfe5e1"
  danger: "#b83c35"
  success-text: "#17683a"
  success-bg: "#e2f4e8"
  warning-text: "#88620c"
  warning-bg: "#fff2cf"
  info-text: "#256081"
  info-bg: "#e3f0f7"
  danger-text: "#a0312b"
  danger-bg: "#f9e3e1"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "clamp(46px, 5.3vw, 72px)"
    lineHeight: 0.99
    letterSpacing: "-3px"
  headline:
    fontFamily: "Georgia, serif"
    fontSize: "clamp(32px, 4vw, 46px)"
    letterSpacing: "-1.5px"
  page-title:
    fontFamily: "Georgia, serif"
    fontSize: "clamp(38px, 4vw, 52px)"
    letterSpacing: "-1.5px"
  body:
    fontFamily: "'Segoe UI', Aptos, Arial, sans-serif"
    fontSize: "16px"
    lineHeight: 1.55
  label:
    fontFamily: "'Segoe UI', Aptos, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 850
    letterSpacing: "1.5px"
rounded:
  nav: "10px"
  field: "11px"
  button: "12px"
  card: "18px"
  pill: "20px"
  panel: "22px"
  leaf: "13px 13px 13px 4px"
components:
  button-primary:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.white}"
    rounded: "{rounded.button}"
    padding: "0.72rem 1.15rem"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    height: "48px"
  card-product:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.card}"
  nav-item:
    textColor: "{colors.ink}"
    rounded: "{rounded.nav}"
    padding: "10px 13px"
  badge-success:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success-text}"
    rounded: "{rounded.pill}"
  badge-warning:
    backgroundColor: "{colors.warning-bg}"
    textColor: "{colors.warning-text}"
    rounded: "{rounded.pill}"
  badge-info:
    backgroundColor: "{colors.info-bg}"
    textColor: "{colors.info-text}"
    rounded: "{rounded.pill}"
  badge-danger:
    backgroundColor: "{colors.danger-bg}"
    textColor: "{colors.danger-text}"
    rounded: "{rounded.pill}"
  brand-mark:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.white}"
    rounded: "{rounded.leaf}"
    size: "40px"
---

<!-- Los títulos de sección van en inglés porque la skill de diseño Impeccable los usa para leer este archivo. -->

# Design System: AgroDirecto

## Overview

**Creative North Star: "El mercado de chacra"**

AgroDirecto se siente como un puesto de feria bien ordenado: cálido, cercano y confiable a simple vista. El verde profundo del campo y el papel crema dan el fondo; los titulares en serif tienen el carácter de un letrero pintado a mano, y el resto de la interfaz habla claro y sin adornos. La confianza nace de la cercanía: se ve quién cultiva, de dónde viene y cuánto cuesta.

La densidad es amable: espacios generosos, tarjetas redondeadas y botones grandes, pensados para el dedo en un celular. El color de marca está en las superficies y los titulares; el dorado aparece poco, como el sol del campo, para marcar lo que importa. Las sombras son suaves y tienen un tinte verde, nunca gris neutro.

**Key Characteristics:**

- Verde bosque como voz principal; crema como papel; dorado como acento escaso.
- Titulares en Georgia, grandes y con letras juntas; texto de trabajo en sans-serif del sistema.
- Formas redondeadas y amables (10–22 px); el logo es una hoja inclinada.
- Sombras difusas con tinte verde que elevan tarjetas y botones sin endurecerlos.
- La identidad del Avance 1 se mantiene: las pantallas nuevas la extienden, no la reemplazan.

## Colors

Una paleta de campo: verdes profundos, papel crema y un dorado de cosecha usado con mesura.

### Primary

- **Verde bosque** (forest): fondo del botón principal, del logo y de los bloques de marca. Es el color que identifica a AgroDirecto.
- **Verde bosque profundo** (forest-deep): titulares grandes y fondos oscuros que necesitan más peso que el verde bosque.

### Secondary

- **Verde hoja** (leaf): etiquetas superiores (eyebrow), enlaces e indicadores de algo positivo o activo.
- **Verde hoja claro** (leaf-light): ilustraciones, detalles y estados suaves del verde hoja.

### Tertiary

- **Dorado de cosecha** (harvest-gold): anillo de foco del teclado, el detalle que debe destacar en una pantalla y la luz cálida del campo.

### Neutral

- **Crema** (cream) y **crema tostado** (cream-deep): secciones de papel, fondos de bloques destacados y bandas que separan contenido.
- **Fondo de página** (page): el blanco apenas verdoso de toda la página.
- **Blanco** (white): tarjetas, campos de formulario y la cabecera.
- **Tinta** (ink): texto principal.
- **Gris hierba** (muted): textos secundarios, ayudas y metadatos.
- **Línea** (line): bordes y separadores.
- **Rojo arcilla** (danger): errores y acciones destructivas.

### Status

Los estados de pedidos y productos usan pares de texto y fondo suave: **éxito** (success-text sobre success-bg), **atención** (warning-text sobre warning-bg), **información** (info-text sobre info-bg) y **problema** (danger-text sobre danger-bg).

### Named Rules

**La regla del sol escaso.** El dorado de cosecha ocupa una fracción mínima de cada pantalla: el foco, un dato clave, un detalle. Si compite con el verde, sobra.

**La regla del verde que manda.** La acción principal de cada pantalla es verde bosque. Solo hay una por vista.

## Typography

**Display Font:** Georgia (con Times New Roman, serif)
**Body Font:** Segoe UI (con Aptos, Arial, sans-serif)

**Character:** el serif de Georgia aporta el tono de letrero de mercado, cálido y con oficio; la sans-serif del sistema carga los datos y formularios sin pesar en un celular con poca señal, porque no descarga fuentes.

### Hierarchy

- **Display** (clamp 46–72 px, interlineado 0.99, espaciado −3 px): el titular de portada. Uno por página.
- **Headline** (clamp 32–46 px, espaciado −1.5 px): títulos de sección en la página pública.
- **Page title** (clamp 38–52 px, espaciado −1.5 px): título de cada pantalla de trabajo (catálogo, paneles).
- **Body** (16 px, interlineado 1.55): todo el texto de lectura y de formularios.
- **Label** (12 px, peso 850, espaciado 1.5 px, MAYÚSCULAS): la etiqueta superior (eyebrow) en verde hoja. Las etiquetas superiores existentes del Avance 1 se retiran en el pulido; las pantallas nuevas no las usan: el titular se sostiene solo.

### Named Rules

**La regla del letrero.** Georgia es solo para titulares. Los precios, cantidades, formularios y tablas van en la sans-serif.

**La regla de la lectura al sol.** Ningún texto que el usuario necesite leer para decidir o actuar (precios, estados, mensajes de error) baja de 12 px. Los badges de estado actuales de 9–10 px se corrigen en el pulido.

## Layout

Contenedor centrado de hasta 1200 px con márgenes laterales. Las páginas públicas alternan bandas de fondo (página, crema) para separar secciones; las pantallas de trabajo usan un título de página y tarjetas.

Puntos de quiebre observados: 1050 px, 900 px, 700 px y 430 px. Por debajo de 700 px la navegación principal se vuelve un menú desplegable y aparece una barra inferior fija con Inicio, Productos, Pedidos, Panel y Carrito. Se diseña primero para un ancho de 390 px.

La cabecera es fija arriba, blanca y semitransparente con desenfoque.

## Elevation & Depth

Sistema con elevación suave: las tarjetas y los botones principales flotan con sombras difusas con tinte verde, nunca negras. La profundidad es ambiental, no estructural; los bordes finos (línea) delimitan y la sombra solo suaviza.

### Shadow Vocabulary

- **Sombra de panel** (`box-shadow: 0 20px 55px rgba(23, 58, 43, 0.1)`): paneles grandes y bloques destacados.
- **Sombra suave** (`box-shadow: 0 8px 28px rgba(23, 58, 43, 0.08)`): tarjetas secundarias.
- **Sombra de tarjeta de producto** (`box-shadow: 0 7px 24px rgba(24, 57, 43, 0.05)`): tarjetas del catálogo en reposo.
- **Sombra del botón principal** (`box-shadow: 0 8px 20px rgba(18, 60, 45, 0.17)`): el botón verde bosque.

### Named Rules

**La regla de la sombra verde.** Toda sombra lleva el tinte del bosque (rgba 18–24, 54–60, 41–45). Una sombra gris neutra se ve ajena a la marca.

## Shapes

Formas amables y redondeadas en toda la interfaz: navegación (10 px), campos (11 px), botones (12 px), tarjetas de producto (18 px), badges en forma de píldora (20 px) y paneles grandes (22 px). La firma de la marca es la **hoja**: un cuadrado redondeado con una esquina casi recta (13 px 13 px 13 px 4 px), girado −3 grados, que se usa en el logo.

## Components

### Buttons

Firmes y amables: grandes, seguros y fáciles de tocar.

- **Shape:** esquinas suaves (12 px).
- **Primary:** fondo verde bosque, texto blanco, relleno de 0.72 rem por 1.15 rem, peso 750 y sombra del botón principal.
- **Hover / Focus:** transición corta (0.2 s) de posición, sombra y fondo. El foco de teclado es un anillo dorado de 3 px separado 2 px del borde.
- **Secondary:** botones claros o con borde, sin sombra, para acciones que acompañan a la principal.

### Chips

- **Style:** los badges de estado son píldoras (20 px) con texto en peso 850 sobre su fondo suave de estado.
- **State:** éxito, atención, información y problema (ver Colors → Status).

### Cards / Containers

- **Corner Style:** 18 px en tarjetas de producto y 22 px en paneles.
- **Background:** blanco sobre el fondo de página o crema.
- **Shadow Strategy:** sombra de tarjeta en reposo; se eleva al pasar el cursor (transición de 0.25 s).
- **Border:** 1 px en un gris verdoso muy claro.

### Inputs / Fields

- **Style:** fondo blanco, borde de 1 px gris verdoso, esquinas de 11 px y altura mínima de 48 px, cómoda para el dedo.
- **Focus:** el anillo dorado de foco.
- **Error / Disabled:** el error usa el rojo arcilla con un mensaje en palabras simples debajo del campo.

### Navigation

- **Style:** botones de texto sin fondo (14 px, peso 650) con esquinas de 10 px; el activo se resalta.
- **Mobile:** menú desplegable y barra inferior fija con íconos y texto.

### Brand Mark

La hoja verde bosque de 40 px con la "A" en Georgia blanca, girada −3 grados, junto a "**Agro**Directo" y el eslogan pequeño.

## Do's and Don'ts

### Do:

- **Do** usar verde bosque para la única acción principal de cada pantalla.
- **Do** escribir titulares en Georgia y todo dato o formulario en la sans-serif del sistema.
- **Do** mantener áreas táctiles de al menos 48 px de alto en campos y botones.
- **Do** teñir de verde todas las sombras (ver Elevation & Depth).
- **Do** mostrar el precio por kg y el precio de referencia del mercado con la misma claridad que el precio.
- **Do** reutilizar los pares de color de estado para cualquier estado nuevo (pago retenido, en disputa, reembolsado).

### Don't:

- **Don't** usar el dorado de cosecha como color de botones o de grandes superficies.
- **Don't** bajar de 12 px un texto que haga falta para decidir o actuar.
- **Don't** usar sombras grises o negras, ni esquinas rectas en botones y tarjetas.
- **Don't** reemplazar la identidad del Avance 1: las pantallas nuevas extienden este sistema.
- **Don't** mostrar íconos sin texto en acciones importantes.
- **Don't** poner una etiqueta (eyebrow) sobre un titular en pantallas nuevas.
- **Don't** usar bordes laterales de color de más de 1 px en avisos o tarjetas; los avisos usan fondo de estado.
