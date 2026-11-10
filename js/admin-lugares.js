const listaLugaresAdmin = document.querySelector('#admin-lugares');
const estadoAdmin = document.querySelector('#admin-estado');
let tokenCsrfAdmin = '';

const cargarLugaresAdmin = async () => {
  try {
    const respuesta = await fetch('../../api/admin-lugares.php');
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.error || 'No se pudieron cargar los lugares.');
    if (!Array.isArray(datos.lugares)) throw new Error('La respuesta de lugares no es válida.');
    tokenCsrfAdmin = datos.csrf_token;

    listaLugaresAdmin.replaceChildren();
    if (datos.lugares.length === 0) {
      estadoAdmin.textContent = 'Todavía no hay lugares registrados.';
      return;
    }

    datos.lugares.forEach((lugar) => listaLugaresAdmin.appendChild(crearFilaAdmin(lugar)));
    estadoAdmin.textContent = '';
  } catch (error) {
    estadoAdmin.textContent = error.message;
    estadoAdmin.classList.add('admin-error');
  }
};

const crearFilaAdmin = (lugar) => {
  const fila = document.createElement('article');
  fila.className = 'admin-lugar';

  const informacion = document.createElement('div');
  const nombre = document.createElement('h2');
  nombre.textContent = lugar.nombre;
  const detalle = document.createElement('p');
  detalle.textContent = `${lugar.tipo} · ${lugar.municipio || lugar.estado} · ${Number(lugar.calificacion_promedio).toFixed(1)} ★ (${lugar.cantidad_resenas} reseñas)${Number(lugar.activo) ? '' : ' · Inactivo'}`;
  informacion.append(nombre, detalle);

  const etiqueta = document.createElement('label');
  etiqueta.className = 'admin-destacar';
  const casilla = document.createElement('input');
  casilla.type = 'checkbox';
  casilla.checked = Number(lugar.prioridad_manual) === 1;
  casilla.addEventListener('change', async () => {
    casilla.disabled = true;
    try {
      const respuesta = await fetch('../../api/admin-lugares.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': tokenCsrfAdmin },
        body: JSON.stringify({ id: Number(lugar.id), destacado: casilla.checked })
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || 'No se pudo actualizar el lugar.');
      lugar.prioridad_manual = casilla.checked ? 1 : 0;
      await cargarLugaresAdmin();
      estadoAdmin.textContent = datos.mensaje;
      estadoAdmin.classList.remove('admin-error');
    } catch (error) {
      casilla.checked = !casilla.checked;
      estadoAdmin.textContent = error.message;
      estadoAdmin.classList.add('admin-error');
    } finally {
      casilla.disabled = false;
    }
  });
  etiqueta.append(casilla, document.createTextNode('Mostrar primero'));
  fila.append(informacion, etiqueta);
  return fila;
};

cargarLugaresAdmin();
