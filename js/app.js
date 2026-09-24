document.addEventListener('DOMContentLoaded', () => {
  const destinos = { oaxaca: 'vista/pagina/oaxaca-de-juarez.html', chiapas: 'vista/estados/chiapas.html' };
  const municipios = {
    oaxaca: [['oaxaca-de-juarez', 'Oaxaca de Juárez']],
    'quintana-roo': [['benito-juarez', 'Benito Juárez']],
    guanajuato: [['guanajuato', 'Guanajuato'], ['san-miguel', 'San Miguel de Allende']],
    jalisco: [['puerto-vallarta', 'Puerto Vallarta']], yucatan: [['merida', 'Mérida']], puebla: [['puebla', 'Puebla']],
    chiapas: [['tuxtla', 'Tuxtla Gutiérrez'], ['san-cristobal', 'San Cristóbal de las Casas']]
  };
  const estado = document.getElementById('estado'), municipio = document.getElementById('municipio'), explorar = document.getElementById('btnExplorar'), buscador = document.querySelector('.hero-buscador input');
  const aviso = document.createElement('div'); aviso.className = 'aviso-sistema'; aviso.setAttribute('role', 'status'); document.body.appendChild(aviso);
  let temporizador;
  const notificar = (mensaje) => { aviso.textContent = mensaje; aviso.classList.add('visible'); clearTimeout(temporizador); temporizador = setTimeout(() => aviso.classList.remove('visible'), 3200); };
  const estadoElegido = new URLSearchParams(window.location.search).get('estado') || localStorage.getItem('miravia_estado');
  if (estadoElegido) {
    const nombre = estadoElegido.replace(/-/g, ' ').replace(/\b\w/g, (letra) => letra.toUpperCase());
    window.setTimeout(() => notificar(`¡Excelente elección! Mira las ideas de viaje para ${nombre}.`), 450);
  }
  const irADestino = (valor) => { window.location.href = destinos[valor] || `vista/estados/estado.html?estado=${encodeURIComponent(valor)}`; };

  /* =========================================
     LOGO MIRAVIA → INICIO (PANTALLA DE VIAJE)
  ========================================= */
  document.getElementById('logoMiravia')?.addEventListener('click', () => { window.location.href = 'inicio.html'; });

  /* =========================================
     ESTADO / MUNICIPIO / EXPLORAR
  ========================================= */
  if (estado && municipio && explorar) {
    municipio.disabled = true;
    estado.addEventListener('change', () => { municipio.innerHTML = '<option value="">Selecciona un municipio</option>'; (municipios[estado.value] || []).forEach(([valor, texto]) => municipio.add(new Option(texto, valor))); municipio.disabled = !estado.value; });
    explorar.addEventListener('click', (evento) => { evento.preventDefault(); if (!estado.value) return notificar('Selecciona un estado para explorar sus destinos.'); if (!municipio.value) return notificar('Selecciona un municipio para continuar.'); irADestino(estado.value); });
  }

  /* =========================================
     BUSCADOR PRINCIPAL (detecta el estado escrito)
  ========================================= */
  const buscarEstado = (texto) => {
    const t = normalizarTexto(texto);
    if (!t) return null;
    const claves = [
      ['baja-california-sur', 'baja california sur'], ['baja-california', 'baja california'],
      ['estado-de-mexico', 'estado de mexico'], ['estado-de-mexico', 'edomex'],
      ['ciudad-de-mexico', 'ciudad de mexico'], ['ciudad-de-mexico', 'cdmx'], ['ciudad-de-mexico', 'mexico df'],
      ['san-luis-potosi', 'san luis potosi'], ['san-luis-potosi', 'slp'],
      ['quintana-roo', 'quintana roo'], ['nuevo-leon', 'nuevo leon'],
      ['quintana-roo', 'cancun'], ['quintana-roo', 'tulum'], ['quintana-roo', 'playa del carmen'],
      ['guanajuato', 'san miguel'], ['jalisco', 'guadalajara'], ['jalisco', 'puerto vallarta'],
      ['yucatan', 'merida'], ['puebla', 'cholula'], ['chiapas', 'san cristobal'], ['chiapas', 'tuxtla'],
      ['oaxaca', 'huatulco'], ['oaxaca', 'puerto escondido'], ['oaxaca', 'monte alban']
    ];
    'aguascalientes campeche chiapas chihuahua coahuila colima durango guanajuato guerrero hidalgo jalisco michoacan morelos nayarit oaxaca puebla queretaro quintana sinaloa sonora tabasco tamaulipas tlaxcala veracruz yucatan zacatecas'.split(' ').forEach((estado) => claves.push([estado, estado]));
    claves.push(['estado-de-mexico', 'mexico']);
    for (const [valor, clave] of claves) if (t.includes(clave)) return valor;
    return null;
  };
  document.querySelector('.hero-buscador button')?.addEventListener('click', (evento) => { evento.preventDefault(); const encontrado = buscarEstado(buscador?.value || ''); if (encontrado) irADestino(encontrado); else notificar('Escribe el nombre de un estado de México, por ejemplo: Oaxaca, Tabasco, Yucatán…'); });
  buscador?.addEventListener('keydown', (evento) => { if (evento.key === 'Enter') document.querySelector('.hero-buscador button')?.click(); });

  /* =========================================
     FAVORITOS
  ========================================= */
  const leerLista = (clave) => { try { return JSON.parse(localStorage.getItem(clave)) || []; } catch (error) { return []; } };
  document.querySelectorAll('.favorito').forEach((boton, indice) => { const clave = `viajamx-favorito-${indice}`, activo = localStorage.getItem(clave) === '1'; boton.classList.toggle('seleccionado', activo); boton.textContent = activo ? '♥' : '♡'; boton.addEventListener('click', () => { const nuevo = !boton.classList.contains('seleccionado'); boton.classList.toggle('seleccionado', nuevo); boton.textContent = nuevo ? '♥' : '♡'; localStorage.setItem(clave, nuevo ? '1' : '0'); notificar(nuevo ? 'Destino guardado en Mis viajes.' : 'Destino eliminado de Mis viajes.'); }); });

  /* =========================================
     MODAL "MIS VIAJES"
  ========================================= */
  const estilosModal = document.createElement('style');
  estilosModal.textContent = '.modal-fondo{position:fixed;inset:0;background:rgba(10,30,40,.55);backdrop-filter:blur(3px);z-index:9998;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;pointer-events:none;transition:.25s ease}.modal-fondo.abierto{opacity:1;pointer-events:auto}.modal-caja{background:#fff;border-radius:20px;max-width:480px;width:100%;max-height:80vh;overflow:auto;box-shadow:0 24px 64px rgba(0,0,0,.3);transform:translateY(18px);transition:.25s ease}.modal-fondo.abierto .modal-caja{transform:translateY(0)}.modal-cuerpo{padding:26px}.modal-titulo{margin:0 0 6px;font-size:24px;color:#113a40}.modal-texto{color:#5b7a76;margin:0 0 16px}.modal-lista{list-style:none;margin:0 0 18px;padding:0}.modal-lista li{display:flex;justify-content:space-between;gap:10px;padding:10px 14px;border-radius:12px;background:#f2f8f6;color:#113a40;font-weight:700;margin-bottom:8px}.modal-lista li small{color:#5b7a76;font-weight:600}.modal-vacio{padding:16px;border-radius:12px;background:#f7f4ec;color:#7a6a4f;font-weight:600;margin-bottom:18px}.modal-acciones{display:flex;gap:10px}.modal-acciones button{flex:1;padding:12px 16px;border:none;border-radius:12px;font-weight:800;cursor:pointer}.btn-modal-ir{background:#0e7c6b;color:#fff}.btn-modal-cerrar{background:#eef4f3;color:#113a40}.modal-cancelar{border:none;background:#fdeef0;color:#c0392b;border-radius:8px;width:26px;height:26px;cursor:pointer;font-weight:800;margin-left:6px}';
  document.head.appendChild(estilosModal);

  const abrirMisViajes = () => {
    const plan = leerLista('miravia_plan');
    const favoritos = leerLista('miravia_favoritos');
    const reservas = leerLista('miravia_reservas');
    const favoritosIndex = Object.keys(localStorage).filter((clave) => clave.startsWith('viajamx-favorito-') && localStorage.getItem(clave) === '1').map((clave) => ['Cancún', 'Oaxaca', 'Guanajuato', 'San Miguel'][parseInt(clave.split('-').pop(), 10)] || 'Destino guardado');
    const todosFavoritos = Array.from(new Set([...favoritosIndex, ...favoritos]));
    const fondo = document.createElement('div');
    fondo.className = 'modal-fondo';
    fondo.innerHTML = `
      <div class="modal-caja">
        <div class="modal-cuerpo">
          <h2 class="modal-titulo">❤️ Mis viajes</h2>
          <p class="modal-texto">Tus reservas, tu plan de viaje y tus destinos favoritos.</p>
          <h3>Reservas de hotel (${reservas.length})</h3>
          ${reservas.length ? `<ul class="modal-lista">${reservas.map((item, indice) => `<li><span>🏨 ${item.hotel}<br><small>${item.llegada} → ${item.salida} · ${item.huespedes} huésped${item.huespedes > 1 ? 'es' : ''} · ${item.noches} noche${item.noches > 1 ? 's' : ''}</small></span><span>${item.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })} <button class="modal-cancelar" data-indice="${indice}" title="Cancelar reserva">✕</button></span></li>`).join('')}</ul>` : '<div class="modal-vacio">Aún no tienes reservas. Entra a "Ver detalles" de un hotel y usa "Reservar ahora".</div>'}
          <h3>Plan de viaje (${plan.length})</h3>
          ${plan.length ? `<ul class="modal-lista">${plan.map((item) => `<li>${item.titulo}${item.precio ? `<small>${item.precio}</small>` : ''}</li>`).join('')}</ul>` : '<div class="modal-vacio">Aún no agregas lugares a tu plan. Usa "Ver detalles" en cualquier destino y presiona "Agregar a mi plan".</div>'}
          <h3>Favoritos (${todosFavoritos.length})</h3>
          ${todosFavoritos.length ? `<ul class="modal-lista">${todosFavoritos.map((nombre) => `<li>${nombre}</li>`).join('')}</ul>` : '<div class="modal-vacio">Guarda destinos con el corazón ♡ para verlos aquí.</div>'}
          <div class="modal-acciones">
            <button class="btn-modal-ir" type="button">Explorar destinos</button>
            <button class="btn-modal-cerrar" type="button">Cerrar</button>
          </div>
        </div>
      </div>`;
    fondo.addEventListener('click', (evento) => {
      if (evento.target === fondo) { fondo.remove(); return; }
      const cancelar = evento.target.closest('.modal-cancelar');
      if (cancelar) {
        const reservasActuales = leerLista('miravia_reservas');
        const fuera = reservasActuales.splice(parseInt(cancelar.dataset.indice, 10), 1);
        guardarLista('miravia_reservas', reservasActuales);
        fondo.remove();
        abrirMisViajes();
        notificar(`Reserva de "${(fuera[0] || {}).hotel || ''}" cancelada.`);
      }
    });
    fondo.querySelector('.btn-modal-cerrar').addEventListener('click', () => fondo.remove());
    fondo.querySelector('.btn-modal-ir').addEventListener('click', () => { fondo.remove(); location.href = 'inicio.html?destinos=1'; });
    document.body.appendChild(fondo);
    fondo.classList.add('abierto');
  };

  /* =========================================
     PERFIL
  ========================================= */
  document.querySelector('.perfil')?.addEventListener('click', () => notificar('Tu perfil y viajes guardados estarán disponibles aquí.'));

  /* =========================================
     SCROLL CON RESPALDO
  ========================================= */
  const scrollHacia = (elemento) => {
    if (!elemento) return;
    const inicio = window.scrollY;
    elemento.scrollIntoView({ behavior: 'smooth' });
    window.setTimeout(() => {
      if (Math.abs(window.scrollY - inicio) < 10) {
        window.scrollTo(0, elemento.getBoundingClientRect().top + window.scrollY - 80);
      }
    }, 700);
  };

  /* =========================================
     CATEGORÍAS DEL HERO
  ========================================= */
  document.querySelectorAll('.hero-categorias span').forEach((categoria) => {
    categoria.style.cursor = 'pointer';
    categoria.addEventListener('click', () => {
      scrollHacia(document.getElementById('experiencias'));
      notificar(`Experiencia ${categoria.textContent.trim()}: elige una tarjeta para explorar.`);
    });
  });

  /* =========================================
     "ENCONTRAR MI DESTINO"
  ========================================= */
  document.querySelector('.btn-secundario')?.addEventListener('click', (evento) => {
    evento.preventDefault();
    scrollHacia(document.querySelector('.explora-mexico'));
    window.setTimeout(() => estado?.focus({ preventScroll: true }), 800);
    notificar('Elige estado y municipio para encontrar tu destino.');
  });

  /* =========================================
     IMÁGENES NO DISPONIBLES
  ========================================= */
  document.querySelectorAll('img').forEach((imagen) => imagen.addEventListener('error', () => { imagen.closest('.imagen-card, .hotel-imagen, .comida-imagen, .lugar-imagen')?.classList.add('imagen-no-disponible'); imagen.alt = 'Imagen del destino próximamente'; }));

  /* =========================================
     ENLACES GENÉRICOS Y FOOTER
  ========================================= */
  document.querySelectorAll('a[href="#"]').forEach((enlace) => enlace.addEventListener('click', (evento) => {
    evento.preventDefault();
    const texto = enlace.textContent.trim().toLowerCase();
    if (texto.includes('hosped')) return window.location.href = 'vista/pagina/hoteles.html';
    if (texto.includes('comida') || texto.includes('gastronom')) return window.location.href = 'vista/pagina/comida.html';
    if (texto.includes('atracc')) return window.location.href = 'inicio.html?destinos=1';
    if (texto.includes('mis viajes') || texto.includes('crear mi viaje')) return abrirMisViajes();
    if (texto.includes('ver todos')) return window.location.href = 'inicio.html?destinos=1';
    if (texto.includes('sobre nosotros')) return notificar('MIRAVIA: tu guía para descubrir México. Proyecto de sistema web.');
    if (texto.includes('ayuda')) return notificar('Centro de ayuda: pronto tendrás preguntas frecuentes aquí.');
    if (texto.includes('contacto')) return notificar('Contacto: soporte@miravia.mx');
    if (enlace.classList.contains('comida-card')) return window.location.href = 'vista/pagina/comida.html';
    if (enlace.classList.contains('experiencia-card')) return scrollHacia(document.getElementById('destinos'));
    if (enlace.classList.contains('link-explorar')) {
      const nombre = (enlace.closest('article')?.querySelector('h3') || {}).textContent || '';
      return irADestino(buscarEstado(nombre) || 'oaxaca');
    }
    if (enlace.closest('footer')) return notificar('Esta sección estará disponible muy pronto.');
    notificar('Esta sección estará disponible muy pronto.');
  }));

  function normalizarTexto(texto) { return (texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
});
