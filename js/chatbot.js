// ==========================================
// MIRAVIA · CHATBOT DE AYUDA AL USUARIO
// Widget autónomo: solo incluir este script.
// ==========================================

(function () {

  const RAIZ = location.pathname.includes('/vista/') ? '../../' : '';

  /* ------------------------------------------
     ESTILOS DEL WIDGET
  ------------------------------------------ */
  const estilos = document.createElement('style');
  estilos.textContent = `
    .chat-flotante{position:fixed;left:22px;bottom:22px;z-index:9990;width:60px;height:60px;border:none;border-radius:50%;
      background:linear-gradient(135deg,#0e7c6b,#12b48f);color:#fff;font-size:26px;cursor:pointer;
      box-shadow:0 10px 28px rgba(14,124,107,.45);transition:transform .2s ease}
    .chat-flotante:hover{transform:scale(1.08)}
    .chat-panel{position:fixed;left:22px;bottom:94px;z-index:9991;width:min(340px,calc(100vw - 44px));height:440px;
      max-height:calc(100vh - 130px);background:#fff;border-radius:20px;box-shadow:0 24px 64px rgba(0,0,0,.3);
      display:flex;flex-direction:column;overflow:hidden;opacity:0;pointer-events:none;transform:translateY(16px);transition:.25s ease}
    .chat-panel.abierto{opacity:1;pointer-events:auto;transform:translateY(0)}
    .chat-cabecera{background:linear-gradient(135deg,#0e7c6b,#12b48f);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px}
    .chat-cabecera .chat-avatar{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:20px}
    .chat-cabecera strong{display:block;font-size:15px}
    .chat-cabecera small{opacity:.85;font-size:12px}
    .chat-cabecera .chat-cerrar{margin-left:auto;background:rgba(255,255,255,.2);border:none;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-weight:800}
    .chat-mensajes{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#f4faf8}
    .chat-msg{max-width:82%;padding:10px 13px;border-radius:14px;font-size:13.5px;line-height:1.5}
    .chat-msg.bot{background:#fff;color:#1d3f3a;border-bottom-left-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.06);white-space:pre-line}
    .chat-msg.usuario{background:#0e7c6b;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
    .chat-sugerencias{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 10px;background:#f4faf8}
    .chat-sugerencias button{border:1.5px solid #bfe3d9;background:#fff;color:#0e7c6b;font-weight:700;font-size:12px;
      padding:6px 11px;border-radius:99px;cursor:pointer}
    .chat-sugerencias button:hover{background:#e2f6ef}
    .chat-entrada{display:flex;gap:8px;padding:10px;border-top:1.5px solid #e4f1ec;background:#fff}
    .chat-entrada input{flex:1;padding:10px 13px;border:1.5px solid #cfe5df;border-radius:99px;font-family:inherit;font-size:13.5px;outline:none}
    .chat-entrada input:focus{border-color:#12b48f}
    .chat-entrada button{width:42px;height:42px;border:none;border-radius:50%;background:#0e7c6b;color:#fff;font-size:17px;cursor:pointer}
  `;
  document.head.appendChild(estilos);

  /* ------------------------------------------
     ESTRUCTURA HTML
  ------------------------------------------ */
  const botonFlotante = document.createElement('button');
  botonFlotante.className = 'chat-flotante';
  botonFlotante.type = 'button';
  botonFlotante.setAttribute('aria-label', 'Abrir chat de ayuda');
  botonFlotante.textContent = '🤖';

  const panel = document.createElement('div');
  panel.className = 'chat-panel';
  panel.innerHTML = `
    <div class="chat-cabecera">
      <div class="chat-avatar">🤖</div>
      <div><strong>Miria · Asistente MIRAVIA</strong><small>En línea · te ayudo a planear tu viaje</small></div>
      <button class="chat-cerrar" type="button" aria-label="Cerrar chat">✕</button>
    </div>
    <div class="chat-mensajes"></div>
    <div class="chat-sugerencias"></div>
    <form class="chat-entrada">
      <input type="text" placeholder="Escribe tu pregunta..." aria-label="Mensaje para el asistente">
      <button type="submit" aria-label="Enviar">➤</button>
    </form>
  `;

  const mensajes = panel.querySelector('.chat-mensajes');
  const sugerencias = panel.querySelector('.chat-sugerencias');
  const campo = panel.querySelector('input');

  const agregarMensaje = (texto, esUsuario) => {
    const burbuja = document.createElement('div');
    burbuja.className = `chat-msg ${esUsuario ? 'usuario' : 'bot'}`;
    burbuja.textContent = texto;
    mensajes.appendChild(burbuja);
    mensajes.scrollTop = mensajes.scrollHeight;
  };

  /* ------------------------------------------
     BASE DE CONOCIMIENTO DEL ASISTENTE
  ------------------------------------------ */
  const responder = (pregunta) => {
    const texto = pregunta.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const tiene = (...palabras) => palabras.some((palabra) => texto.includes(palabra));

    if (tiene('hola', 'buenas', 'buen dia', 'buenas tardes', 'buenas noches'))
      return '¡Hola! 👋 Soy Miria, tu asistente de viajes. Puedo recomendarte destinos, hoteles o comida. ¿Qué te gustaría explorar hoy?';

    if (tiene('hotel', 'hosped', 'dormir', 'alojam'))
      return '🏨 En la sección Hospedaje encuentras hoteles en Oaxaca de Juárez con precios desde $650 por noche.\nPuedes filtrar por tipo, precio y calificación, y reservar desde "Ver detalles". ¿Quieres que te lleve ahí?';
    if (tiene('reserv', 'reserva'))
      return 'Para reservar: entra a Hospedaje, presiona "Ver detalles" en el hotel que te guste, elige fechas y huéspedes, y presiona "Reservar ahora". Tu reserva aparecerá en "Mis viajes". 🗓️';

    if (tiene('comida', 'comer', 'restaurant', 'gastronom', 'taco', 'mole', 'tamales'))
      return '🍴 En la sección Comida tienes restaurantes oaxaqueños, mercados y cafeterías desde $120 por persona.\nPuedes filtrar por tipo de cocina y precio. ¿Te llevo a esa sección?';

    if (tiene('destino', 'estado', 'visitar', 'lugares', 'atracc'))
      return '🗺️ En el explorador de destinos puedes elegir cualquiera de los 28 estados de México y ver sus lugares turísticos.\nPor ahora Chiapas y Oaxaca tienen municipios con información completa. ¿Te llevo al explorador?';

    if (tiene('oaxaca'))
      return '🏛️ ¡Oaxaca de Juárez es una joya! No te pierdas el Templo de Santo Domingo, el Mercado Benito Juárez, Monte Albán y Hierve el Agua.\nEn la página del destino tienes el mapa con los puntos turísticos marcados. 📍';

    if (tiene('chiapas', 'san cristobal', 'tuxtla', 'canyon', 'cañon'))
      return '🌲 Chiapas te espera con San Cristóbal de las Casas, Tuxtla Gutiérrez y el Cañón del Sumidero.\nEntra al explorador de destinos, selecciona Chiapas y luego un municipio.';

    if (tiene('playa', 'cancun', 'quintana', 'caribe'))
      return '🏖️ Si buscas playa, Cancún y la Riviera Maya (Quintana Roo) son ideales: aguas cristalinas y zonas arqueológicas.\nPronto tendremos su página dedicada. Mientras tanto explora el explorador de estados.';

    if (tiene('precio', 'cuanto cuesta', 'costo', 'barato', 'presupuesto', 'economico'))
      return '💰 Precios de referencia:\n· Hoteles: desde $650 MXN por noche\n· Comida: desde $120 MXN por persona\n· Cabañas: desde $900 MXN\nPuedes filtrar por tu presupuesto en las secciones de Hospedaje y Comida.';

    if (tiene('favorito', 'corazon', 'corazón'))
      return '♡ Guarda tus destinos favoritos con el corazón que aparece en cada tarjeta. Los verás reunidos en "Mis viajes". ♥';

    if (tiene('mis viaje', 'plan', 'itinerario', 'reserva cancel'))
      return '🧳 En "Mis viajes" (menú superior) encuentras 3 cosas:\n· Tus reservas de hotel con fechas y totales\n· Tu plan de viaje con los lugares guardados\n· Tus favoritos\nTambién puedes cancelar reservas desde ahí.';

    if (tiene('cancel'))
      return 'Puedes cancelar una reserva desde "Mis viajes": presiona la ✕ junto a la reserva que ya no quieres. Sin costos extras. ✅';

    if (tiene('mapa', 'ubicacion', 'ubicación', 'donde estoy', 'dónde estoy', 'gps'))
      return '📍 La página principal muestra tu ubicación actual en el mapa (si permites el acceso a tu ubicación en el navegador).\nDesde ahí puedes moverte por el mapa con los botones + y −.';

    if (tiene('filtr', 'buscar', 'busqueda', 'búsqueda'))
      return '🔎 Para encontrar lo que buscas:\n· Usa la barra de búsqueda de la página principal para destinos\n· En Hospedaje y Comida usa los filtros de tipo, precio y calificación\n· Presiona "Aplicar filtros" y "Limpiar" para restablecer.';

    if (tiene('gracias', 'perfecto', 'excelente', 'genial'))
      return '¡Con gusto! 🌟 Si necesitas algo más, aquí estoy. ¡Que tengas un excelente viaje! 🇲🇽';

    if (tiene('adios', 'adiós', 'chao', 'hasta luego', 'bye'))
      return '¡Hasta pronto! ✈️ Recuerda guardar tus destinos favoritos. ¡Buen viaje!';

    if (tiene('ayuda', 'que puedes hacer', 'qué puedes hacer', 'como funcionas', 'cómo funcionas'))
      return 'Soy Miria y puedo ayudarte con:\n· 🗺️ Recomendaciones de destinos y estados\n· 🏨 Información de hoteles y cómo reservar\n· 🍴 Dónde comer\n· 💰 Precios y presupuestos\n· 🧳 Tus reservas, planes y favoritos\nEscribe tu pregunta o toca una sugerencia.';

    return 'Hmm, no estoy seguro de entender. 🤔 Puedo ayudarte con destinos, hoteles, comida, precios o tus reservas.\nPrueba tocando una de las sugerencias que aparecen abajo. 💬';
  };

  const SUGERENCIAS = [
    { texto: '🏨 Hoteles', accion: () => { location.href = RAIZ + (location.pathname.includes('/vista/') ? '' : 'vista/') + 'pagina/hoteles.html'; } },
    { texto: '🍴 Comida', accion: () => { location.href = RAIZ + (location.pathname.includes('/vista/') ? '' : 'vista/') + 'pagina/comida.html'; } },
    { texto: '🗺️ Destinos', accion: () => { location.href = RAIZ + 'inicio.html?destinos=1'; } },
    { texto: '🧳 Mis viajes', accion: () => { document.querySelector('.perfil')?.click() || document.querySelector('.btn-usuario')?.click(); } },
    { texto: '❓ ¿Qué puedes hacer?', accion: null }
  ];

  const responderYAgregar = (pregunta) => {
    agregarMensaje(pregunta, true);
    const respuesta = responder(pregunta);
    window.setTimeout(() => {
      agregarMensaje(respuesta, false);
      const llevaA = respuesta.match(/¿Te llevo a esa sección\?|¿Te llevo al explorador\?|¿Quieres que te lleve ahí\?/);
      if (llevaA) {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.textContent = 'Sí, llévame ➜';
        boton.style.cssText = 'align-self:flex-start;border:none;background:#0e7c6b;color:#fff;font-weight:700;font-size:12.5px;padding:7px 13px;border-radius:99px;cursor:pointer';
        boton.addEventListener('click', () => {
          if (/hotel|hosped/.test(respuesta)) location.href = RAIZ + 'vista/pagina/hoteles.html';
          else if (/Comida|restaurant/.test(respuesta)) location.href = RAIZ + 'vista/pagina/comida.html';
          else location.href = RAIZ + 'inicio.html?destinos=1';
        });
        mensajes.appendChild(boton);
        mensajes.scrollTop = mensajes.scrollHeight;
      }
    }, 550);
  };

  const pintarSugerencias = () => {
    sugerencias.innerHTML = '';
    SUGERENCIAS.forEach((item) => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.textContent = item.texto;
      boton.addEventListener('click', () => {
        if (item.accion) { item.accion(); panel.classList.remove('abierto'); return; }
        responderYAgregar(item.texto.replace(/^[^\w]+\s*/, ''));
      });
      sugerencias.appendChild(boton);
    });
  };

  panel.querySelector('form').addEventListener('submit', (evento) => {
    evento.preventDefault();
    const texto = campo.value.trim();
    if (!texto) return;
    campo.value = '';
    responderYAgregar(texto);
  });

  panel.querySelector('.chat-cerrar').addEventListener('click', () => panel.classList.remove('abierto'));
  botonFlotante.addEventListener('click', () => {
    panel.classList.toggle('abierto');
    if (panel.classList.contains('abierto')) { pintarSugerencias(); campo.focus(); }
  });

  const bienvenida = () => {
    agregarMensaje('¡Hola! 👋 Soy Miria, tu asistente de MIRAVIA.\nPuedo ayudarte con destinos, hoteles, comida, precios y tus reservas. Escribe o toca una sugerencia. 😊', false);
  };

  document.body.appendChild(botonFlotante);
  document.body.appendChild(panel);
  bienvenida();

})();
