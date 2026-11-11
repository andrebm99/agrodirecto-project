# Product

<!-- impeccable:product-schema 1 -->

<!-- Los títulos de sección van en inglés porque la skill de diseño Impeccable los usa para leer este archivo. -->

## Platform

web

## Users

- **Principal: compradores empresariales.** Restaurantes, bodegas y pequeños comercios del Perú que compran productos frescos para su negocio. Buscan, comparan, piden y pagan el servicio. Su tarea: conseguir productos confiables a precio justo, sabiendo quién los cultivó y dónde, sin regatear ni pasar por un acopiador. Deciden rápido, muchas veces desde el celular del negocio y entre otras tareas.
- **Secundarios: agentes de campo y productores (uso operativo).** Los agentes (promotores, personal de una cooperativa o un familiar con celular) publican productos, registran y verifican en persona a los agricultores y atienden pedidos en nombre de quienes no tienen computadora. Los productores con smartphone gestionan su perfil, sus productos y sus pedidos. Trabajan desde el campo, en un celular con poca señal.
- **Agricultores sin smartphone:** no usan la web. Reciben SMS y aceptan o rechazan pedidos respondiendo "1" o "2". La web nunca debe asumir que quien mira la pantalla es el agricultor.
- **Administración:** supervisa cuentas, disputas, precios de referencia y un registro de auditoría.

## Product Purpose

AgroDirecto conecta directamente a pequeños agricultores del Perú con compradores empresariales. Hoy al agricultor se le regatea en persona o vende barato a cadenas de supermercados que luego multiplican el precio; el comprador no tiene información confiable sobre el origen, la disponibilidad ni el precio justo. AgroDirecto permite pedir directo al precio que publica el agricultor, con el dinero protegido hasta la entrega.

El éxito es que el agricultor reciba el 100% del precio que fijó (más el flete), que el comprador confíe en el precio y en el origen lo suficiente para volver a pedir, y que los agricultores sin computadora también puedan vender.

## Positioning

- **Precio fijo y justo, sin regateo.** El agricultor fija el precio y el comprador no puede contraofertar; el único descuento es por volumen y lo decide el agricultor. Cada producto muestra el precio de referencia del mercado (mayorista y minorista por kg) para que el comprador vea que el precio es justo.
- **El agricultor recibe su precio íntegro.** La comisión de servicio (5%) la paga el comprador y se muestra en cada pedido ("de los S/ 306.40 que pagas, S/ 293.00 van íntegros al agricultor").
- **Pago protegido.** El comprador paga primero; el dinero queda retenido y se libera al Yape, Plin o Cuenta DNI del agricultor cuando se confirma la entrega (o a las 48 h sin reclamo).
- **Funciona sin computadora.** Los agentes de campo operan en nombre del agricultor, y el agricultor responde los pedidos por SMS.

## Operating Context

- Flujo de compra: catálogo → elegir presentación (pequeña, intermedia o mayorista) → cotización con desglose transparente → pago (simulado: Yape, Plin, tarjeta o transferencia) → el agricultor acepta → preparación → entrega → el comprador confirma o reporta un problema en 24 h → se libera el pago.
- La entrega depende de las zonas de cobertura del agricultor (regiones, días de tránsito, pedido mínimo, flete) y de la vida útil del producto: el sistema rechaza pedidos que llegarían malogrados.
- Un productor por pedido. Las cuentas nuevas sin verificar tienen topes (S/ 1 500 por pedido y 2 pedidos en curso).
- Disputas: el comprador reporta con foto, el agricultor presenta su descargo y la administración decide; mientras tanto el pago queda congelado.
- Actualizaciones en tiempo real por WebSocket (estado de pedidos y stock) y una campana de avisos.
- Contexto peruano: moneda en soles (S/), 25 regiones, DNI y RUC como documentos, Yape y Plin como medios de pago cotidianos.

## Capabilities and Constraints

- Frontend: React 19 + Vinext/Vite, Bootstrap 5, Leaflet + OpenStreetMap, desplegado en Cloudflare Workers. Navegación con `#` (`#catalogo`, `#producto/1`).
- Backend: API REST + WebSocket aparte (`agrodirecto-backend`, Spring Boot + MySQL) con JWT. El frontend no guarda datos del negocio en `localStorage`; en el navegador solo viven el token y el carrito sin confirmar.
- Roles: comprador, productor, agente y administrador. Administradores y agentes deben usar verificación en dos pasos (TOTP con una app de autenticación).
- Solo ubicación aproximada: los mapas públicos muestran la zona de la chacra redondeada a ~1 km, nunca una dirección exacta. Los teléfonos y la dirección exacta de entrega se revelan solo cuando el agricultor acepta el pedido.
- Proyecto académico (UTP, Desarrollo Full Stack 2026): los pagos son simulados y todavía no hay clientes reales.
- Sin decidir: la subida de imágenes (hoy los productos usan un conjunto fijo de fotos o una URL https).

## Brand Commitments

- Nombre: **AgroDirecto** (el logo destaca "Agro" + "Directo").
- Eslogan: **"Del campo a tu negocio, sin tantos intermediarios."**
- El **mensaje del precio justo debe verse en la experiencia**: el agricultor recibe su precio íntegro y la comisión la paga el comprador.
- Todos los textos de la interfaz están en español (Perú). Hoy se trata al usuario de "tú"; es la costumbre actual, no un compromiso confirmado.

## Evidence on Hand

- Fotos de productos: `public/images/products/` (papas, tomates, paltas, café, granos, plátanos) y `public/images/hero-market.jpg`.
- Capturas del Avance 1: `docs/screenshots/`.
- Los datos de demostración (16 productos, 6 productores, una agente y una cooperativa) son **ficticios**. Los precios de referencia son ilustrativos, no cotizaciones oficiales.
- **No hay testimonios, clientes, cifras de ventas, aliados ni certificaciones reales.** No inventar ninguno; el contenido de demostración se rotula como tal.

## Product Principles

1. **El agricultor primero.** Cada decisión se evalúa con una pregunta: ¿ayuda o excluye a un agricultor de escasos recursos? Nunca exigirle computadora, RUC ni conocimientos técnicos.
2. **La transparencia genera confianza.** Mostrar el precio por kg, la referencia del mercado, a dónde va el dinero y el historial del pedido. Nunca esconder cobros.
3. **Explicar las reglas, no solo aplicarlas.** Cuando una regla de negocio bloquea una acción (productores mezclados, fuera de cobertura, vida útil corta, pedido mínimo), decir por qué en palabras simples y qué hacer en su lugar.
4. **Proteger a ambas partes.** El pago retenido, las reseñas verificadas, las disputas con evidencia y los datos de contacto protegidos sirven tanto al comprador como al agricultor.
5. **Rápido en un celular con poca señal.** Toda pantalla debe funcionar en un celular con conexión lenta antes de pulirse para escritorio.

## Accessibility & Inclusion

- Celular primero en todo: los agentes usan celulares con señal 3G en zonas rurales y los compradores piden desde el celular del negocio.
- Español simple, frases cortas y sin tecnicismos (muchos agentes y agricultores tienen poca educación formal). Los íconos acompañan al texto, nunca lo reemplazan.
- Áreas táctiles grandes y texto legible para usarse al aire libre con luz intensa.
- Objetivo WCAG 2.1 AA en contraste y en acceso con teclado y lector de pantalla.
