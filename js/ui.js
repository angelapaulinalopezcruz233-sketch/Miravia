document.addEventListener('DOMContentLoaded', () => {
  const raiz = location.pathname.includes('/vista/') ? '../../' : '';

  /* =========================================
     LOGO MIRAVIA → INICIO (PANTALLA DE VIAJE)
  ========================================= */
  const logoMiravia = document.querySelector('.logo');
  if (logoMiravia) {
    logoMiravia.style.cursor = 'pointer';
    logoMiravia.style.pointerEvents = 'auto';
    logoMiravia.title = 'Inicio';
    logoMiravia.addEventListener('click', (evento) => {
      evento.preventDefault();
      window.location.href = `${raiz}inicio.html`;
    });
  }

  /* =========================================
     AVISOS
  ========================================= */
  const estilos = document.createElement('style');
  estilos.textContent = '.aviso-sistema{position:fixed;right:24px;bottom:24px;z-index:9999;max-width:330px;padding:14px 18px;border-radius:14px;background:#113a40;color:#fff;box-shadow:0 12px 32px rgba(0,0,0,.22);font-weight:700;opacity:0;transform:translateY(14px);pointer-events:none;transition:.25s ease}.aviso-sistema.visible{opacity:1;transform:translateY(0)}'
    + '.modal-fondo{position:fixed;inset:0;background:rgba(10,30,40,.55);backdrop-filter:blur(3px);z-index:9998;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;pointer-events:none;transition:.25s ease}'
    + '.modal-fondo.abierto{opacity:1;pointer-events:auto}'
    + '.modal-caja{background:#fff;border-radius:20px;max-width:520px;width:100%;max-height:85vh;overflow:auto;box-shadow:0 24px 64px rgba(0,0,0,.3);transform:translateY(18px);transition:.25s ease}'
    + '.modal-fondo.abierto .modal-caja{transform:translateY(0)}'
    + '.modal-imagen{width:100%;height:220px;object-fit:cover;border-radius:20px 20px 0 0;background:#e8f4f1}'
    + '.modal-cuerpo{padding:22px 26px 26px}'
    + '.modal-tipo{display:inline-block;font-size:12px;font-weight:800;letter-spacing:.08em;color:#0e7c6b;background:#e2f6ef;padding:4px 12px;border-radius:99px;margin-bottom:10px}'
    + '.modal-titulo{margin:0 0 6px;font-size:24px;color:#113a40}'
    + '.modal-ubicacion{color:#5b7a76;margin:0 0 10px;font-size:14px}'
    + '.modal-datos{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:12px;font-weight:800;color:#113a40}'
    + '.modal-descripcion{color:#44615d;line-height:1.55;margin:0 0 18px}'
    + '.modal-acciones{display:flex;gap:10px;flex-wrap:wrap}'
    + '.modal-acciones button{flex:1;min-width:150px;padding:12px 16px;border:none;border-radius:12px;font-weight:800;cursor:pointer;font-size:14px}'
    + '.btn-modal-plan{background:#0e7c6b;color:#fff}'
    + '.btn-modal-fav{background:#fdeef0;color:#c0392b}'
    + '.btn-modal-cerrar{background:#eef4f3;color:#113a40}'
    + '.modal-reserva{margin-top:18px;padding:16px;border:2px solid #d9efe9;border-radius:14px;background:#f4fbf8}'
    + '.modal-reserva h3{margin:0 0 12px;color:#113a40;font-size:16px}'
    + '.modal-reserva .res-fila{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px}'
    + '.modal-reserva label{flex:1;min-width:130px;font-size:13px;font-weight:700;color:#44615d;display:flex;flex-direction:column;gap:5px}'
    + '.modal-reserva input{padding:9px 10px;border:1.5px solid #cfe5df;border-radius:10px;font-family:inherit;font-size:14px}'
    + '.res-total{font-weight:800;color:#113a40;margin:8px 0 12px}'
    + '.btn-modal-reservar{width:100%;padding:12px;border:none;border-radius:12px;background:#0e7c6b;color:#fff;font-weight:800;cursor:pointer;font-size:15px}'
    + '.misviajes-caja{background:#fff;border-radius:20px;max-width:480px;width:100%;max-height:80vh;overflow:auto;box-shadow:0 24px 64px rgba(0,0,0,.3);padding:26px}'
    + '.misviajes-caja h2{margin:0 0 6px;font-size:24px;color:#113a40}'
    + '.misviajes-caja h3{margin:14px 0 8px;color:#113a40;font-size:15px}'
    + '.misviajes-caja ul{list-style:none;margin:0 0 10px;padding:0}'
    + '.misviajes-caja li{display:flex;justify-content:space-between;gap:10px;padding:10px 14px;border-radius:12px;background:#f2f8f6;color:#113a40;font-weight:700;margin-bottom:8px;font-size:14px}'
    + '.misviajes-caja li small{color:#5b7a76;font-weight:600}'
    + '.misviajes-caja .vacio{padding:12px;border-radius:12px;background:#f7f4ec;color:#7a6a4f;font-weight:600;margin-bottom:10px;font-size:13.5px}'
    + '.misviajes-caja .acciones{display:flex;gap:10px;margin-top:14px}'
    + '.misviajes-caja .acciones button{flex:1;padding:11px 14px;border:none;border-radius:12px;font-weight:800;cursor:pointer}'
    + '.btn-cancelar-reserva{border:none;background:#fdeef0;color:#c0392b;border-radius:8px;width:26px;height:26px;cursor:pointer;font-weight:800;margin-left:6px}';
  document.head.appendChild(estilos);

  const aviso = document.createElement('div');
  aviso.className = 'aviso-sistema';
  aviso.setAttribute('role', 'status');
  document.body.appendChild(aviso);
  let tiempo;
  const mostrar = (texto) => { aviso.textContent = texto; aviso.classList.add('visible'); clearTimeout(tiempo); tiempo = setTimeout(() => aviso.classList.remove('visible'), 3000); };

  /* =========================================
     PLAN DE VIAJE Y FAVORITOS (localStorage)
  ========================================= */
  const leerLista = (clave) => { try { return JSON.parse(localStorage.getItem(clave)) || []; } catch (error) { return []; } };
  const guardarLista = (clave, lista) => localStorage.setItem(clave, JSON.stringify(lista));

  const agregarAlPlan = (lugar) => {
    const plan = leerLista('miravia_plan');
    if (plan.some((item) => item.titulo === lugar.titulo)) return mostrar(`${lugar.titulo} ya está en tu plan de viaje.`);
    plan.push(lugar);
    guardarLista('miravia_plan', plan);
    mostrar(`"${lugar.titulo}" se agregó a tu plan de viaje.`);
  };

  const alternarFavorito = (titulo) => {
    const favoritos = leerLista('miravia_favoritos');
    const indice = favoritos.indexOf(titulo);
    if (indice >= 0) { favoritos.splice(indice, 1); mostrar(`"${titulo}" se quitó de favoritos.`); }
    else { favoritos.push(titulo); mostrar(`"${titulo}" se guardó en favoritos.`); }
    guardarLista('miravia_favoritos', favoritos);
    return indice < 0;
  };

  /* =========================================
     MODAL DE DETALLES
  ========================================= */
  const normalizar = (texto) => (texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const leerPrecio = (texto) => { const numero = parseInt((texto || '').replace(/[^\d]/g, ''), 10); return isNaN(numero) ? 0 : numero; };

  let fondoModal = null;
  const abrirModal = (datos) => {
    if (!fondoModal) {
      fondoModal = document.createElement('div');
      fondoModal.className = 'modal-fondo';
      fondoModal.addEventListener('click', (evento) => { if (evento.target === fondoModal) fondoModal.classList.remove('abierto'); });
      document.body.appendChild(fondoModal);
    }
    fondoModal.innerHTML = `
      <div class="modal-caja">
        ${datos.imagen ? `<img class="modal-imagen" src="${datos.imagen}" alt="${datos.titulo}">` : ''}
        <div class="modal-cuerpo">
          ${datos.tipo ? `<span class="modal-tipo">${datos.tipo}</span>` : ''}
          <h2 class="modal-titulo">${datos.titulo}</h2>
          ${datos.ubicacion ? `<p class="modal-ubicacion">📍 ${datos.ubicacion}</p>` : ''}
          <div class="modal-datos">
            ${datos.calificacion ? `<span>★ ${datos.calificacion}</span>` : ''}
            ${datos.precio ? `<span>${datos.precio}</span>` : ''}
          </div>
          ${datos.descripcion ? `<p class="modal-descripcion">${datos.descripcion}</p>` : ''}
          <div class="modal-acciones">
            <button class="btn-modal-plan" type="button">➕ Agregar a mi plan</button>
            <button class="btn-modal-fav" type="button">♡ Favorito</button>
            <button class="btn-modal-cerrar" type="button">Cerrar</button>
          </div>
          ${datos.esHotel ? `
          <div class="modal-reserva">
            <h3>🗓️ Reservar estadía</h3>
            <div class="res-fila">
              <label>Llegada <input type="date" class="res-llegada"></label>
              <label>Salida <input type="date" class="res-salida"></label>
              <label>Huéspedes <input type="number" class="res-huespedes" min="1" max="10" value="2"></label>
            </div>
            <div class="res-total">Total estimado: <strong class="res-monto">Selecciona tus fechas</strong></div>
            <button class="btn-modal-reservar" type="button">Reservar ahora</button>
          </div>` : ''}
        </div>
      </div>`;
    fondoModal.querySelector('.btn-modal-plan').addEventListener('click', () => { agregarAlPlan({ titulo: datos.titulo, tipo: datos.tipo, precio: datos.precio }); fondoModal.classList.remove('abierto'); });
    fondoModal.querySelector('.btn-modal-fav').addEventListener('click', (evento) => { const activo = alternarFavorito(datos.titulo); evento.currentTarget.textContent = activo ? '♥ Favorito' : '♡ Favorito'; });
    fondoModal.querySelector('.btn-modal-cerrar').addEventListener('click', () => fondoModal.classList.remove('abierto'));
    if (datos.esHotel) {
      const llegada = fondoModal.querySelector('.res-llegada');
      const salida = fondoModal.querySelector('.res-salida');
      const huespedes = fondoModal.querySelector('.res-huespedes');
      const monto = fondoModal.querySelector('.res-monto');
      const calcular = () => {
        if (!llegada.value || !salida.value) return;
        const noches = Math.round((new Date(salida.value) - new Date(llegada.value)) / 86400000);
        if (noches <= 0) { monto.textContent = 'La salida debe ser después de la llegada'; return; }
        const total = noches * datos.precioNoche * (parseInt(huespedes.value, 10) || 1);
        monto.textContent = `${noches} noche${noches > 1 ? 's' : ''} · ${total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })}`;
      };
      [llegada, salida, huespedes].forEach((campo) => campo.addEventListener('change', calcular));
      llegada.min = new Date().toISOString().split('T')[0];
      salida.min = llegada.min;
      fondoModal.querySelector('.btn-modal-reservar').addEventListener('click', () => {
        if (!llegada.value || !salida.value) return mostrar('Selecciona la fecha de llegada y de salida.');
        const noches = Math.round((new Date(salida.value) - new Date(llegada.value)) / 86400000);
        if (noches <= 0) return mostrar('La fecha de salida debe ser después de la llegada.');
        const reservas = leerLista('miravia_reservas');
        reservas.push({
          hotel: datos.titulo,
          llegada: llegada.value,
          salida: salida.value,
          huespedes: parseInt(huespedes.value, 10) || 1,
          noches: noches,
          total: noches * datos.precioNoche * (parseInt(huespedes.value, 10) || 1)
        });
        guardarLista('miravia_reservas', reservas);
        fondoModal.classList.remove('abierto');
        mostrar(`¡Reserva confirmada en ${datos.titulo}! ${noches} noche${noches > 1 ? 's' : ''}. Revísala en Mis viajes.`);
      });
    }
    fondoModal.classList.add('abierto');
  };

  const leerTarjeta = (boton) => {
    const tarjeta = boton.closest('article');
    if (!tarjeta) return null;
    const tipo = tarjeta.querySelector('.tipo-hotel, .tipo-comida, .etiqueta-card');
    const calificacion = tarjeta.querySelector('.calificacion strong, .rating');
    const precio = tarjeta.querySelector('.hotel-precio strong, .comida-precio strong, .precio');
    const descripcion = tarjeta.querySelector('.descripcion');
    const caracteristicas = Array.from(tarjeta.querySelectorAll('.caracteristicas span')).map((item) => item.textContent.trim()).join(' · ');
    const imagen = tarjeta.querySelector('img');
    return {
      titulo: (tarjeta.querySelector('h2, h3') || {}).textContent?.trim() || 'Lugar',
      tipo: tipo ? tipo.textContent.trim() : '',
      ubicacion: (tarjeta.querySelector('.ubicacion') || {}).textContent?.replace('📍', '').trim() || '',
      calificacion: calificacion ? calificacion.textContent.replace('★', '').trim() : '',
      precio: precio ? precio.textContent.trim() : '',
      descripcion: [descripcion ? descripcion.textContent.trim() : '', caracteristicas].filter(Boolean).join(' · '),
      imagen: imagen ? imagen.getAttribute('src') : '',
      esHotel: Boolean(tarjeta.querySelector('.hotel-precio')),
      precioNoche: leerPrecio(precio ? precio.textContent : '')
    };
  };

  /* =========================================
     FILTROS REALES (HOTELES Y COMIDA)
  ========================================= */
  const configurarFiltros = () => {
    const contenedorTarjetas = document.querySelector('.lista-hoteles, .lista-comida');
    if (!contenedorTarjetas) return;
    const esHoteles = Boolean(document.querySelector('.lista-hoteles'));
    const panel = document.querySelector('.filtros, aside');
    if (!panel) return;
    const tarjetas = Array.from(contenedorTarjetas.querySelectorAll('article'));
    const ordenOriginal = tarjetas.slice();
    const contador = document.querySelector('.resultado strong');

    const buscarInput = panel.querySelector('.input-busqueda input');
    const rangoPrecio = panel.querySelector('input.rango');
    const selectorHabitaciones = esHoteles ? panel.querySelector('.filtro select') : null;
    const ordenar = document.querySelector('.ordenar');
    const etiquetaPrecio = rangoPrecio ? rangoPrecio.closest('.filtro').querySelector('.precios') : null;

    const checkboxes = Array.from(panel.querySelectorAll('input[type="checkbox"]'));
    const esCalificacion = (caja) => Boolean(caja.closest('label').querySelector('.estrellas')) || (caja.closest('label').querySelector('span') || {}).textContent?.trim().startsWith('⭐');
    const umbralDe = (caja) => { const numero = parseFloat((caja.closest('label').textContent.match(/(\d+\.?\d*)/) || [])[1]); return isNaN(numero) ? 0 : numero; };
    const textoDe = (caja) => normalizar((caja.closest('label').querySelector('span') || {}).textContent?.replace(/[^\wÁÉÍÓÚáéíóúÑñüÜ\s]/g, ' ').replace(/\s+/g, ' '));

    const habitacionesEnRango = (tarjeta, opcion) => {
      if (!opcion || opcion === 0 || !selectorHabitaciones) return true;
      const span = Array.from(tarjeta.querySelectorAll('.caracteristicas span')).find((item) => item.textContent.includes('habitaciones'));
      const total = parseInt((span ? span.textContent : '').replace(/[^\d]/g, ''), 10) || 0;
      if (opcion === 1) return total >= 1 && total <= 10;
      if (opcion === 2) return total >= 11 && total <= 30;
      if (opcion === 3) return total >= 31 && total <= 50;
      return total > 50;
    };

    const aplicar = () => {
      const busqueda = normalizar(buscarInput ? buscarInput.value : '');
      const precioMaximo = rangoPrecio ? parseInt(rangoPrecio.value, 10) : Infinity;
      const tiposElegidos = checkboxes.filter((caja) => caja.checked && !esCalificacion(caja)).map(textoDe).filter(Boolean);
      const umbrales = checkboxes.filter((caja) => caja.checked && esCalificacion(caja)).map(umbralDe).filter((valor) => valor > 0);
      const calificacionMinima = umbrales.length ? Math.min(...umbrales) : 0;
      const visibles = [];

      tarjetas.forEach((tarjeta) => {
        const titulo = normalizar((tarjeta.querySelector('h2, h3') || {}).textContent);
        const tipo = normalizar((tarjeta.querySelector('.tipo-hotel, .tipo-comida') || {}).textContent);
        const precio = leerPrecio((tarjeta.querySelector('.hotel-precio strong, .comida-precio strong') || {}).textContent);
        const calificacion = parseFloat((tarjeta.querySelector('.calificacion strong') || {}).textContent) || 0;
        const opcionHabitaciones = selectorHabitaciones ? Array.from(selectorHabitaciones.options).findIndex((opcion) => opcion.selected) : 0;

        const pasaBusqueda = !busqueda || titulo.includes(busqueda);
        const pasaTipo = !tiposElegidos.length || tiposElegidos.some((elegido) => tipo === elegido || tipo.includes(elegido));
        const pasaPrecio = precioMaximo === Infinity || precio <= precioMaximo;
        const pasaCalificacion = !calificacionMinima || calificacion >= calificacionMinima;
        const pasaHabitaciones = habitacionesEnRango(tarjeta, opcionHabitaciones);
        const visible = pasaBusqueda && pasaTipo && pasaPrecio && pasaCalificacion && pasaHabitaciones;

        tarjeta.style.display = visible ? '' : 'none';
        if (visible) visibles.push(tarjeta);
      });

      if (contador) contador.textContent = visibles.length;
    };

    const ordenarTarjetas = () => {
      if (!ordenar) return;
      const modo = ordenar.selectedIndex;
      const lista = contenedorTarjetas;
      if (modo === 0) { ordenOriginal.forEach((tarjeta) => lista.appendChild(tarjeta)); return; }
      const ordenados = visiblesOrdenables().sort((a, b) => {
        if (modo === 3) return (parseFloat((b.querySelector('.calificacion strong') || {}).textContent) || 0) - (parseFloat((a.querySelector('.calificacion strong') || {}).textContent) || 0);
        const precioA = leerPrecio((a.querySelector('.hotel-precio strong, .comida-precio strong') || {}).textContent);
        const precioB = leerPrecio((b.querySelector('.hotel-precio strong, .comida-precio strong') || {}).textContent);
        return modo === 1 ? precioA - precioB : precioB - precioA;
      });
      ordenados.forEach((tarjeta) => lista.appendChild(tarjeta));
    };

    const visiblesOrdenables = () => tarjetas.filter((tarjeta) => tarjeta.style.display !== 'none');

    const limpiar = () => {
      checkboxes.forEach((caja) => { caja.checked = false; });
      if (buscarInput) buscarInput.value = '';
      if (rangoPrecio) { rangoPrecio.value = rangoPrecio.defaultValue; if (etiquetaPrecio) etiquetaPrecio.innerHTML = `<span>$${rangoPrecio.min}</span><span>$${parseInt(rangoPrecio.max).toLocaleString('es-MX')}</span>`; }
      if (selectorHabitaciones) selectorHabitaciones.selectedIndex = 0;
      if (ordenar) ordenar.selectedIndex = 0;
      tarjetas.forEach((tarjeta) => { tarjeta.style.display = ''; });
      ordenOriginal.forEach((tarjeta) => contenedorTarjetas.appendChild(tarjeta));
      if (contador) contador.textContent = tarjetas.length;
      mostrar('Filtros restablecidos.');
    };

    panel.querySelector('.btn-aplicar, .btn-filtros')?.addEventListener('click', () => { aplicar(); ordenarTarjetas(); mostrar(`Filtros aplicados: ${visiblesOrdenables().length} resultados.`); });
    panel.querySelector('.limpiar, .btn-limpiar')?.addEventListener('click', limpiar);
    if (buscarInput) buscarInput.addEventListener('input', aplicar);
    if (rangoPrecio) rangoPrecio.addEventListener('change', aplicar);
    if (ordenar) ordenar.addEventListener('change', () => { ordenarTarjetas(); mostrar('Resultados reordenados.'); });
  };
  configurarFiltros();

  /* =========================================
     FAVORITOS EN TARJETAS DE HOTELES
  ========================================= */
  const favoritosGuardados = leerLista('miravia_favoritos');
  document.querySelectorAll('.hotel-favorito').forEach((icono) => {
    const tarjeta = icono.closest('article');
    const titulo = ((tarjeta || {}).querySelector('h2') || {}).textContent?.trim();
    if (!titulo) return;
    const activo = favoritosGuardados.includes(titulo);
    icono.textContent = activo ? '♥' : '♡';
    icono.classList.toggle('seleccionado', activo);
    icono.style.cursor = 'pointer';
    icono.addEventListener('click', () => {
      const nuevo = alternarFavorito(titulo);
      icono.textContent = nuevo ? '♥' : '♡';
      icono.classList.toggle('seleccionado', nuevo);
    });
  });

  /* =========================================
     MODAL "MIS VIAJES" (EN TODAS LAS PÁGINAS)
  ========================================= */
  const abrirMisViajes = () => {
    const reservas = leerLista('miravia_reservas');
    const plan = leerLista('miravia_plan');
    const favoritos = leerLista('miravia_favoritos');
    const fondo = document.createElement('div');
    fondo.className = 'modal-fondo';
    fondo.innerHTML = `
      <div class="misviajes-caja">
        <h2>❤️ Mis viajes</h2>
        <p style="color:#5b7a76;margin:0 0 4px">Tus reservas, tu plan de viaje y tus favoritos.</p>
        <h3>Reservas de hotel (${reservas.length})</h3>
        ${reservas.length ? `<ul>${reservas.map((item, indice) => `<li><span>🏨 ${item.hotel}<br><small>${item.llegada} → ${item.salida} · ${item.huespedes} huésped${item.huespedes > 1 ? 'es' : ''} · ${item.noches} noche${item.noches > 1 ? 's' : ''}</small></span><span>${item.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })}<button class="btn-cancelar-reserva" data-indice="${indice}" title="Cancelar reserva">✕</button></span></li>`).join('')}</ul>` : '<div class="vacio">Aún no tienes reservas. En "Ver detalles" de un hotel usa "Reservar ahora".</div>'}
        <h3>Plan de viaje (${plan.length})</h3>
        ${plan.length ? `<ul>${plan.map((item) => `<li>${item.titulo}${item.precio ? `<small>${item.precio}</small>` : ''}</li>`).join('')}</ul>` : '<div class="vacio">Usa "Agregar a mi plan" desde cualquier detalle.</div>'}
        <h3>Favoritos (${favoritos.length})</h3>
        ${favoritos.length ? `<ul>${favoritos.map((nombre) => `<li>${nombre}</li>`).join('')}</ul>` : '<div class="vacio">Guarda lugares con el corazón ♡.</div>'}
        <div class="acciones">
          <button class="btn-cerrar-misviajes" type="button" style="background:#eef4f3;color:#113a40">Cerrar</button>
        </div>
      </div>`;
    fondo.addEventListener('click', (evento) => {
      if (evento.target === fondo) { fondo.remove(); return; }
      const cancelar = evento.target.closest('.btn-cancelar-reserva');
      if (cancelar) {
        const lista = leerLista('miravia_reservas');
        const fuera = lista.splice(parseInt(cancelar.dataset.indice, 10), 1);
        guardarLista('miravia_reservas', lista);
        fondo.remove();
        abrirMisViajes();
        mostrar(`Reserva de "${(fuera[0] || {}).hotel || ''}" cancelada.`);
      }
    });
    fondo.querySelector('.btn-cerrar-misviajes').addEventListener('click', () => fondo.remove());
    document.body.appendChild(fondo);
    fondo.classList.add('abierto');
  };

  /* =========================================
     PUNTOS DEL MAPA (OAXACA)
  ========================================= */
  document.querySelectorAll('.punto-turistico').forEach((punto) => {
    punto.addEventListener('click', () => mostrar(`📍 ${punto.title || punto.textContent.trim()}: un lugar imperdible para tu visita.`));
  });

  /* =========================================
     NAVEGACIÓN GENERAL
  ========================================= */
  document.addEventListener('click', (evento) => {
    const enlace = evento.target.closest('a'), boton = evento.target.closest('button');
    if (enlace) {
      const destinoEnlace = enlace.getAttribute('href') || '';
      if (destinoEnlace.startsWith('#') && destinoEnlace.length > 1) return;
      const texto = enlace.textContent.trim().toLowerCase();
      if (texto === 'destinos') { evento.preventDefault(); location.href = `${raiz}inicio.html?destinos=1`; }
      else if (texto.includes('hosped')) { evento.preventDefault(); location.href = `${raiz}vista/pagina/hoteles.html`; }
      else if (texto === 'comida' || texto === 'gastronomía') { evento.preventDefault(); location.href = `${raiz}vista/pagina/comida.html`; }
      else if (texto.includes('atracc')) { evento.preventDefault(); location.href = `${raiz}inicio.html?destinos=1`; }
      else if (texto.includes('mis viajes')) { evento.preventDefault(); abrirMisViajes(); }
      else if (texto.includes('volver')) { evento.preventDefault(); history.length > 1 ? history.back() : (location.href = `${raiz}inicio.html?destinos=1`); }
      else if (enlace.getAttribute('href') === '#') { evento.preventDefault(); mostrar('Esta sección estará disponible muy pronto.'); }
    }
    if (boton && !boton.matches('.estado, .municipio, #btnExplorar')) {
      if (boton.classList.contains('btn-volver')) {
        history.length > 1 ? history.back() : (location.href = `${raiz}inicio.html?destinos=1`);
        return;
      }
      if (boton.classList.contains('btn-detalles') || boton.classList.contains('btn-card')) {
        const datos = leerTarjeta(boton);
        if (datos) abrirModal(datos); else mostrar('Detalles disponibles próximamente.');
      }
      else if (boton.classList.contains('btn-plan')) {
        const datos = leerTarjeta(boton) || { titulo: ((document.querySelector('h1') || {}).textContent || document.title).replace('MIRAVIA | ', '').replace('ViajaMX', '').replace('|', '').trim() || 'Este lugar' };
        agregarAlPlan({ titulo: datos.titulo, tipo: datos.tipo || '', precio: datos.precio || '' });
      }
      else if (boton.classList.contains('btn-usuario') || boton.classList.contains('perfil')) abrirMisViajes();
    }
  });
});
