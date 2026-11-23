/**
 * =====================================================================
 * LÓGICA DE "MIS ESTABLECIMIENTOS" (Conectado a BD real y Modales)
 * =====================================================================
 */

const ICONOS_TIPO = {
    hotel:       'fa-hotel',
    restaurante: 'fa-utensils',
    atraccion:   'fa-ticket'
};

const LABEL_TIPO = {
    hotel:       'Hotel',
    restaurante: 'Restaurante',
    atraccion:   'Atracción'
};

async function renderEstablecimientos(filtro = 'todos') {
    const grid = document.getElementById('grid-establecimientos');
    if (!grid) return;

    grid.innerHTML = `<p class="vacio">Cargando establecimientos...</p>`;

    const datos = await obtenerEstablecimientos();
    
    if (!datos || !datos.establecimientos || datos.establecimientos.length === 0) {
        grid.innerHTML = `<p class="vacio">No tienes establecimientos registrados.</p>`;
        return;
    }

    const lista = filtro === 'todos'
        ? datos.establecimientos
        : datos.establecimientos.filter(e => e.tipo === filtro);

    if (lista.length === 0) {
        grid.innerHTML = `<p class="vacio">No hay establecimientos en esta categoría.</p>`;
        return;
    }

    grid.innerHTML = lista.map(e => `
        <div class="card-establecimiento">
            <div class="estab-header">
                <div class="estab-icono ${e.tipo}">
                    <i class="fa-solid ${ICONOS_TIPO[e.tipo] || 'fa-map-marker-alt'}"></i>
                </div>
                <span class="estab-estado ${e.activo == 1 ? 'activo' : 'inactivo'}">
                    ${e.activo == 1 ? '● Activo' : '● Inactivo'}
                </span>
            </div>

            <h3 class="estab-nombre">${e.nombre}</h3>
            <p class="estab-tipo">${LABEL_TIPO[e.tipo] || e.tipo}</p>

            <p class="estab-ubicacion">
                <i class="fa-solid fa-location-dot"></i>
                ${e.municipio ? e.municipio + ', ' : ''}${e.estado || 'Sin ubicación'}
            </p>

            <div class="estab-datos">
                <div>
                    <p class="dato-label">Comisión</p>
                    <p class="dato-valor">${parseFloat(e.comision_porcentaje)}%</p>
                </div>
                <div>
                    <p class="dato-label">Calificación</p>
                    <p class="dato-valor">⭐ ${parseFloat(e.calificacion_promedio)}</p>
                </div>
                <div>
                    <p class="dato-label">Reservaciones</p>
                    <p class="dato-valor">${e.total_reservaciones}</p>
                </div>
            </div>

            <div class="estab-acciones">
                <button class="btn-secundario"><i class="fa-solid fa-eye"></i> Ver</button>
                <!-- Aquí pasamos los datos al hacer clic en Editar -->
                <button class="btn-secundario" onclick="abrirModalEditar(${e.id}, '${(e.nombre||'').replace(/'/g, "\\'")}', '${e.tipo}', '${(e.direccion||'').replace(/'/g, "\\'")}', '${(e.descripcion||'').replace(/'/g, "\\'")}')">
                    <i class="fa-solid fa-pen"></i> Editar
                </button>
            </div>
        </div>
    `).join('');
}

function initFiltros() {
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            renderEstablecimientos(chip.dataset.filtro);
        });
    });
}

// ==========================================
// LÓGICA DEL MODAL DE CREAR
// ==========================================
function initModalCrear() {
    const btnNuevo = document.getElementById('btn-nuevo-establecimiento');
    const modal = document.getElementById('modal-nuevo-establecimiento');
    const btnCerrar = document.getElementById('btn-cerrar-modal');
    const btnCancelar = document.getElementById('btn-cancelar-modal');
    const form = document.getElementById('form-nuevo-establecimiento');
    const btnGuardar = document.getElementById('btn-guardar');

    if (!modal) return;

    if (btnNuevo) btnNuevo.addEventListener('click', () => modal.classList.add('show'));
    
    const cerrarModal = () => {
        modal.classList.remove('show');
        if(form) form.reset(); 
    };
    
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarModal);
    if (btnCancelar) btnCancelar.addEventListener('click', cerrarModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(); });

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            btnGuardar.textContent = 'Guardando...';
            btnGuardar.disabled = true;

            const formData = new FormData();
            formData.append('propietario_id', PROPIETARIO_ID);
            formData.append('nombre', document.getElementById('input-nombre').value);
            formData.append('tipo', document.getElementById('input-tipo').value);
            formData.append('ubicacion', document.getElementById('input-ubicacion').value);
            
            const descInput = document.getElementById('input-descripcion');
            if(descInput) formData.append('descripcion', descInput.value);

            const imagenInput = document.getElementById('input-imagen');
            if (imagenInput && imagenInput.files.length > 0) {
                formData.append('imagen', imagenInput.files[0]);
            }

            try {
                const respuesta = await fetch('../api/guardar_establecimiento.php', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await respuesta.json();

                if (data.ok) {
                    alert('✅ ¡Establecimiento guardado con éxito!');
                    cerrarModal();
                    renderEstablecimientos();
                } else {
                    alert('❌ Error real: \n' + JSON.stringify(data, null, 2));
                }
            } catch (error) {
                console.error(error);
                alert('❌ Error de conexión al guardar.');
            } finally {
                btnGuardar.textContent = 'Guardar y continuar';
                btnGuardar.disabled = false;
            }
        });
    }
}

// ==========================================
// LÓGICA DEL MODAL DE EDITAR
// ==========================================
function abrirModalEditar(id, nombre, tipo, ubicacion, descripcion) {
    const modal = document.getElementById('modal-editar-establecimiento');
    
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-nombre').value = nombre;
    document.getElementById('edit-tipo').value = tipo;
    document.getElementById('edit-ubicacion').value = ubicacion;
    document.getElementById('edit-descripcion').value = descripcion;

    modal.classList.add('show');
}

function initModalEditar() {
    const modal = document.getElementById('modal-editar-establecimiento');
    const btnCerrar = document.getElementById('btn-cerrar-modal-editar');
    const btnCancelar = document.getElementById('btn-cancelar-modal-editar');
    const form = document.getElementById('form-editar-establecimiento');
    const btnGuardar = document.getElementById('btn-guardar-editar');

    if (!modal) return;

    const cerrarModal = () => modal.classList.remove('show');
    
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarModal);
    if (btnCancelar) btnCancelar.addEventListener('click', cerrarModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal();
    });

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            btnGuardar.textContent = 'Guardando...';
            btnGuardar.disabled = true;

            const formData = new FormData();
            formData.append('id', document.getElementById('edit-id').value);
            formData.append('propietario_id', PROPIETARIO_ID);
            formData.append('nombre', document.getElementById('edit-nombre').value);
            formData.append('tipo', document.getElementById('edit-tipo').value);
            formData.append('ubicacion', document.getElementById('edit-ubicacion').value);
            formData.append('descripcion', document.getElementById('edit-descripcion').value);

            try {
                const respuesta = await fetch('../api/actualizar_establecimiento.php', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await respuesta.json();

                if (data.ok) {
                    alert('✅ Establecimiento actualizado con éxito.');
                    cerrarModal();
                    renderEstablecimientos(); 
                } else {
                    alert('❌ Error real: \n' + JSON.stringify(data, null, 2));
                }
            } catch (error) {
                console.error(error);
                alert('❌ Error de conexión al actualizar.');
            } finally {
                btnGuardar.textContent = 'Guardar cambios';
                btnGuardar.disabled = false;
            }
        });
    }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderEstablecimientos();
    initFiltros();
    initModalCrear();
    initModalEditar();
});