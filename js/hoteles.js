const cargarHotelesRegistrados = async () => {
  const lista = document.querySelector('.lista-hoteles');
  const estadoListado = lista && lista.querySelector('.estado-listado');
  const contador = document.querySelector('#conteo-hoteles');

  if (!lista || !estadoListado || !contador) return;

  try {
    const parametros = new URLSearchParams({
      estado: 'oaxaca',
      municipio: 'Oaxaca de Juárez'
    });
    const respuesta = await fetch(`../../api/hoteles.php?${parametros.toString()}`);
    if (!respuesta.ok) {
      throw new Error(`La consulta de alojamientos respondió ${respuesta.status}.`);
    }

    const datos = await respuesta.json();
    if (!Array.isArray(datos.hoteles)) {
      throw new Error('La respuesta de alojamientos no tiene un formato válido.');
    }

    const hoteles = datos.hoteles;
    contador.textContent = String(hoteles.length);
    configurarRangoPrecio(hoteles);

    hoteles.forEach((hotel) => {
      lista.appendChild(crearTarjetaHotel(hotel));
    });

    if (hoteles.length) {
      estadoListado.hidden = true;
    } else {
      estadoListado.classList.remove('estado-cargando');
      estadoListado.querySelector('.estado-icono').textContent = '⌂';
      estadoListado.querySelector('strong').textContent = 'Aún no hay hospedajes registrados';
      estadoListado.querySelector('span:last-child').textContent = 'Cuando se agregue un alojamiento para este destino, aparecerá aquí.';
    }

    window.dispatchEvent(new Event('hoteles:cargados'));
  } catch (error) {
    console.error('No se pudieron cargar los alojamientos registrados.', error);
    estadoListado.classList.remove('estado-cargando');
    estadoListado.querySelector('.estado-icono').textContent = '!';
    estadoListado.querySelector('strong').textContent = 'No pudimos cargar los hospedajes';
    estadoListado.querySelector('span:last-child').textContent = 'Verifica la conexión y vuelve a intentarlo.';
    estadoListado.classList.add('estado-listado-error');
    estadoListado.setAttribute('role', 'alert');
  }
};

const configurarRangoPrecio = (lugares) => {
  const rango = document.querySelector('.filtros input.rango');
  if (!rango) return;
  const precios = lugares.map((hotel) => Number(hotel.precio_desde)).filter((precio) => Number.isFinite(precio) && precio > 0);
  if (precios.length === 0) {
    rango.disabled = true;
    return;
  }

  const maximo = Math.ceil(Math.max(...precios));
  rango.min = '0';
  rango.max = String(maximo);
  rango.value = String(maximo);
  rango.defaultValue = String(maximo);
  rango.disabled = false;
  rango.closest('.filtro').querySelector('.precio-maximo').textContent = maximo.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  });
};

const crearTarjetaHotel = (hotel) => {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'hotel-card';
  tarjeta.dataset.establecimientoId = String(hotel.id);
  tarjeta.dataset.prioridadManual = String(hotel.prioridad_manual || 0);

  const imagen = document.createElement('div');
  imagen.className = 'hotel-imagen';
  const imagenHotel = document.createElement('img');
  imagenHotel.src = '../../img/lugares/hotel.png';
  imagenHotel.alt = `Alojamiento: ${hotel.nombre}`;
  imagen.appendChild(imagenHotel);

  if (Number(hotel.prioridad_manual)) {
    const etiquetaDestacado = document.createElement('span');
    etiquetaDestacado.className = 'hotel-etiqueta';
    etiquetaDestacado.textContent = 'Destacado';
    imagen.appendChild(etiquetaDestacado);
  }

  const informacion = document.createElement('div');
  informacion.className = 'hotel-info';

  const contenido = document.createElement('div');
  contenido.className = 'hotel-contenido';

  const tipo = document.createElement('span');
  tipo.className = 'tipo-hotel';
  tipo.textContent = 'HOTEL';

  const nombre = document.createElement('h2');
  nombre.textContent = hotel.nombre;

  const ubicacion = document.createElement('p');
  ubicacion.className = 'ubicacion';
  ubicacion.textContent = `📍 ${hotel.direccion || `${hotel.municipio}, ${hotel.estado}`}`;

  contenido.append(tipo, nombre, ubicacion);

  const calificacion = Number(hotel.calificacion_promedio);
  if (Number.isFinite(calificacion) && calificacion > 0) {
    const bloqueCalificacion = document.createElement('div');
    bloqueCalificacion.className = 'calificacion';

    const estrella = document.createElement('span');
    estrella.textContent = '★';
    const valor = document.createElement('strong');
    valor.textContent = calificacion.toFixed(1);
    const total = document.createElement('small');
    total.textContent = `(${Number(hotel.cantidad_resenas) || 0})`;
    bloqueCalificacion.append(estrella, valor, total);
    contenido.appendChild(bloqueCalificacion);
  }

  if (hotel.descripcion) {
    const descripcion = document.createElement('p');
    descripcion.className = 'descripcion';
    descripcion.textContent = hotel.descripcion;
    contenido.appendChild(descripcion);
  }

  const precio = Number(hotel.precio_desde);
  const bloquePrecio = document.createElement('div');
  bloquePrecio.className = 'hotel-precio';
  if (Number.isFinite(precio) && precio > 0) {
    const etiquetaPrecio = document.createElement('span');
    etiquetaPrecio.textContent = 'Desde';
    const valorPrecio = document.createElement('strong');
    valorPrecio.textContent = precio.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    });
    const periodo = document.createElement('small');
    periodo.textContent = '/ noche';
    bloquePrecio.append(etiquetaPrecio, valorPrecio, periodo);
  }

  const detalles = document.createElement('button');
  detalles.className = 'btn-detalles';
  detalles.type = 'button';
  detalles.textContent = 'Ver detalles →';
  bloquePrecio.appendChild(detalles);

  informacion.append(contenido, bloquePrecio);
  tarjeta.append(imagen, informacion);
  return tarjeta;
};

cargarHotelesRegistrados();
