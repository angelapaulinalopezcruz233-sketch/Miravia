const cargarRestaurantesRegistrados = async () => {
  const lista = document.querySelector('.lista-comida');
  const estadoListado = lista && lista.querySelector('.estado-listado');
  const contador = document.querySelector('#conteo-restaurantes');

  if (!lista || !estadoListado || !contador) return;

  try {
    const parametros = new URLSearchParams({
      estado: 'oaxaca',
      municipio: 'Oaxaca de Juárez'
    });
    const respuesta = await fetch(`../../api/restaurantes.php?${parametros.toString()}`);
    if (!respuesta.ok) {
      throw new Error(`La consulta de restaurantes respondió ${respuesta.status}.`);
    }

    const datos = await respuesta.json();
    if (!Array.isArray(datos.restaurantes)) {
      throw new Error('La respuesta de restaurantes no tiene un formato válido.');
    }

    const restaurantes = datos.restaurantes;
    contador.textContent = String(restaurantes.length);
    configurarRangoPrecio(restaurantes);
    restaurantes.forEach((restaurante) => lista.appendChild(crearTarjetaRestaurante(restaurante)));

    if (restaurantes.length) {
      estadoListado.hidden = true;
    } else {
      estadoListado.classList.remove('estado-cargando');
      estadoListado.querySelector('.estado-icono').textContent = '⌕';
      estadoListado.querySelector('strong').textContent = 'Aún no hay lugares registrados';
      estadoListado.querySelector('span:last-child').textContent = 'Cuando se agregue un lugar para este destino, aparecerá aquí.';
    }

    window.dispatchEvent(new Event('restaurantes:cargados'));
  } catch (error) {
    console.error('No se pudieron cargar los restaurantes registrados.', error);
    estadoListado.classList.remove('estado-cargando');
    estadoListado.querySelector('.estado-icono').textContent = '!';
    estadoListado.querySelector('strong').textContent = 'No pudimos cargar los lugares';
    estadoListado.querySelector('span:last-child').textContent = 'Verifica la conexión y vuelve a intentarlo.';
    estadoListado.classList.add('estado-listado-error');
    estadoListado.setAttribute('role', 'alert');
  }
};

const configurarRangoPrecio = (lugares) => {
  const rango = document.querySelector('.filtros input.rango');
  if (!rango) return;
  const precios = lugares.map((lugar) => Number(lugar.precio_desde)).filter((precio) => Number.isFinite(precio) && precio > 0);
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

const crearTarjetaRestaurante = (restaurante) => {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'comida-card';
  tarjeta.dataset.establecimientoId = String(restaurante.id);
  tarjeta.dataset.prioridadManual = String(restaurante.prioridad_manual || 0);

  const imagen = document.createElement('div');
  imagen.className = 'comida-imagen';
  const imagenRestaurante = document.createElement('img');
  imagenRestaurante.src = '../../img/lugares/comedor.png';
  imagenRestaurante.alt = `Restaurante: ${restaurante.nombre}`;
  imagen.appendChild(imagenRestaurante);

  const informacion = document.createElement('div');
  informacion.className = 'comida-info';

  const tipo = document.createElement('span');
  tipo.className = 'tipo-comida';
  tipo.textContent = 'Restaurante';

  const nombre = document.createElement('h2');
  nombre.textContent = restaurante.nombre;

  const ubicacion = document.createElement('p');
  ubicacion.className = 'ubicacion';
  ubicacion.textContent = `📍 ${restaurante.direccion || `${restaurante.municipio}, ${restaurante.estado}`}`;

  informacion.append(tipo, nombre, ubicacion);

  if (restaurante.descripcion) {
    const descripcion = document.createElement('p');
    descripcion.className = 'descripcion';
    descripcion.textContent = restaurante.descripcion;
    informacion.appendChild(descripcion);
  }

  const calificacion = Number(restaurante.calificacion_promedio);
  const cantidad = Number(restaurante.cantidad_resenas);
  if (calificacion > 0) {
    const bloqueCalificacion = document.createElement('div');
    bloqueCalificacion.className = 'calificacion';
    const estrella = document.createElement('span');
    estrella.className = 'estrella';
    estrella.textContent = '★';
    const valor = document.createElement('strong');
    valor.textContent = calificacion.toFixed(1);
    const total = document.createElement('span');
    total.textContent = `(${cantidad})`;
    bloqueCalificacion.append(estrella, valor, total);
    informacion.appendChild(bloqueCalificacion);
  }

  const precio = Number(restaurante.precio_desde);
  const bloquePrecio = document.createElement('div');
  bloquePrecio.className = 'comida-precio';
  if (Number.isFinite(precio) && precio > 0) {
    const valorPrecio = document.createElement('strong');
    valorPrecio.textContent = precio.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    });
    const periodo = document.createElement('span');
    periodo.textContent = '/ persona';
    bloquePrecio.append(valorPrecio, periodo);
  }

  const detalles = document.createElement('button');
  detalles.className = 'btn-detalles';
  detalles.type = 'button';
  detalles.textContent = 'Ver detalles';
  bloquePrecio.appendChild(detalles);

  tarjeta.append(imagen, informacion, bloquePrecio);
  return tarjeta;
};

cargarRestaurantesRegistrados();
