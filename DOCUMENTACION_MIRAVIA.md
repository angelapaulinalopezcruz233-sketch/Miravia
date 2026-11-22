# Documentación de MIRAVIA

Este proyecto es una app web de viajes en México. Su flujo principal es:

1. El usuario entra a la landing page.
2. Elige un estado o destino.
3. El sistema muestra un mapa de México y luego una página dinámica del estado.
4. El usuario puede ver hoteles, comida, lugares turísticos y armar un viaje.
5. Si quiere iniciar sesión, el sistema usa PHP + MySQL para autenticar usuarios.

La idea general es combinar:
- HTML para la estructura.
- CSS para el estilo.
- JavaScript para la interactividad.
- PHP para autenticación.
- MySQL para la base de datos.
- Leaflet + Three.js + GSAP para mapas y animaciones.

---

## 1) Estructura principal del proyecto

### Archivos de entrada
- `index.html`: redirige al usuario a `inicio.html`.
- `login.html`: pantalla de acceso.
- `inicio.html`: pantalla principal con el mapa y animación.

### Carpeta `api/`
- `db.php`: conecta la app con la base de datos.
- `auth.php`: valida correo + contraseña y crea la sesión.
- `registrar.php`: crea un usuario nuevo con contraseña encriptada.
- `sesion.php`: revisa si el usuario ya está autenticado.

### Carpeta `js/`
- `animacion-inicio.js`: crea la tierra 3D, el mapa y la experiencia visual inicial.
- `selector-viaje.js`: define los estados de México y el comportamiento del mapa.
- `login.js`: maneja el login y registro de usuarios.
- `app.js`: archivo de apoyo usado para la lógica general del selector de viajes.

### Carpeta `vista/`
- `vista/estados/estado.html`: página dinámica por estado.
- `vista/js/datos-estados.js`: contiene la información de cada estado, hoteles, restaurantes y lugares turísticos.
- `vista/js/estado.js`: controla la interfaz de la página del estado.
- `vista/js/ubicacion.js`: ayuda a mostrar ubicaciones y sitios dentro del estado.

### Carpeta `estilo/`
Aquí están todos los estilos visuales: inicio, login, viajes, hoteles, etc.

### `database/`
- `miravia.sql`: esquema SQL de la base de datos con roles y usuarios.

### `datos/municipios/`
- Archivos GeoJSON con los límites y municipios de cada estado.

---

## 2) Flujo de la app

### 2.1 Inicio del sistema
`index.html` tiene una redirección inmediata:

```html
<meta http-equiv="refresh" content="0;url=inicio.html">
```

Eso significa que cuando el usuario abre la raíz, casi enseguida entra a `inicio.html`.

### 2.2 Pantalla de login
`login.html` muestra:
- un panel visual de bienvenida,
- un formulario de inicio de sesión,
- un formulario de registro,
- una animación 3D con Three.js.

El archivo `js/login.js` hace la parte importante:
- detecta si el usuario ya tiene sesión,
- cambia de login a registro,
- muestra/oculta la contraseña,
- envía peticiones POST a `api/auth.php` y `api/registrar.php`.

### 2.3 Pantalla principal de viaje
`inicio.html` carga:
- Leaflet (mapa interactivo),
- Three.js (tierra 3D),
- GSAP (animaciones suaves),
- `animacion-inicio.js`,
- `selector-viaje.js`.

La lógica se ve así:

1. Se crea una escena 3D con la Tierra.
2. Se mueve la cámara para simular acercamiento.
3. Se crea un mapa de México con Leaflet.
4. El usuario puede tocar un estado o un punto del mapa.
5. Al seleccionar un estado, se guarda en `localStorage`.
6. Al pulsar “Comenzar viaje”, se redirige a la vista del estado.

---

## 3) Explicación de archivos clave

## 3.1 `api/db.php`

```php
function conectarBaseDatos(): PDO
{
    $host = '127.0.0.1';
    $baseDatos = 'miravia_db';
    $usuario = 'root';
    $contrasena = '';

    $dsn = "mysql:host={$host};dbname={$baseDatos};charset=utf8mb4";
    return new PDO($dsn, $usuario, $contrasena, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}
```

Qué hace:
- crea la cadena de conexión a MySQL,
- usa la base `miravia_db`,
- devuelve un objeto PDO que permite consultar la base de datos,
- activa errores para detectar fallos rápidamente.

Esto sirve como “puente” entre PHP y MySQL.

---

## 3.2 `api/auth.php`

Este archivo valida el login.

### Secuencia lógica
1. Inicia sesión PHP con `session_start()`.
2. Cambia el tipo de respuesta a JSON.
3. Carga `db.php`.
4. Revisa que la solicitud sea POST.
5. Lee los datos enviados por fetch en JSON.
6. Extrae correo y contraseña.
7. Verifica que la información no venga vacía.
8. Busca al usuario con ese correo en la tabla `usuarios`.
9. Usa `password_verify()` para comparar la contraseña con el hash.
10. Si todo coincide, guarda la sesión:
   - `usuario_id`
   - `rol_id`
   - `nombre`
   - `correo`
11. Devuelve un JSON con `ok: true`.

Puntos importantes:
- `responder()` manda la respuesta JSON y corta la ejecución con `exit`.
- Si algo falla, se registra el error con `error_log()`.
- Este archivo es la puerta de entrada al sistema privado.

---

## 3.3 `api/registrar.php`

Este archivo crea una cuenta nueva.

### Qué valida
- que haya nombre, correo y contraseña,
- que el nombre no supere 100 caracteres,
- que el correo sea válido,
- que la contraseña tenga al menos 8 caracteres,
- que no exista un correo duplicado,
- que la contraseña se guarde cifrada con `password_hash()`.

### Proceso
1. Recibe JSON con `nombre`, `correo` y `contrasena`.
2. Valida los datos.
3. Consulta si ya existe el correo.
4. Si no existe, hace `INSERT INTO usuarios`.
5. Usa `rol_id = 3` como “usuario público”.
6. Devuelve `201 Created` con éxito.

Este archivo cumple la seguridad principal de la app: nunca guarda la contraseña en texto claro.

---

## 3.4 `api/sesion.php`

Este archivo solo revisa si hay una sesión activa.

### Lógica
- Si `$_SESSION['usuario_id']` existe, entonces el usuario está autenticado.
- Devuelve JSON con:
  - `autenticado: true`
  - el id, nombre y correo del usuario.
- Si no hay sesión, responde:
  - `autenticado: false`

Esto sirve para redirigir al usuario de vuelta a `inicio.html` cuando ya está logueado.

---

## 4) `js/login.js`: explicación del flujo de inicio de sesión

Este archivo es el “motor del acceso”.

### Secciones principales

#### 1. Selección de elementos del DOM
Hace esto:

```js
const formulario = document.getElementById("formLogin");
const formularioRegistro = document.getElementById("formRegistro");
const correo = document.getElementById("correo");
const password = document.getElementById("password");
```

Eso busca los inputs del HTML y guarda referencias para poder leer/escribir en ellos desde JavaScript.

#### 2. Función `enviarAuth()`
Esta función:
- usa `fetch()` para enviar datos a PHP,
- convierte el cuerpo a JSON,
- valida que la respuesta sea JSON correcta,
- lanza un error si el servidor respondió mal.

Es una capa muy importante porque el front end no puede depender de respuestas HTML no válidas.

#### 3. Cambio entre login y registro
`cambiarModoRegistro(true/false)`:
- muestra o oculta cada formulario,
- cambia el texto del encabezado,
- limpia mensajes,
- enfoca el campo apropiado.

#### 4. Mostrar/ocultar contraseña
`mostrarPassword` cambia la propiedad `type` del input entre `password` y `text`.

#### 5. Verificar sesión existente
Se hace un `fetch` a `api/sesion.php`:
- si el usuario ya tiene sesión, `window.location.replace("inicio.html")`.

#### 6. Login
Cuando presionas “Iniciar sesión”:
- se evita el envío normal del formulario,
- se valida el formulario,
- se envía `correo` y `contrasena` a `api/auth.php`,
- si la respuesta es correcta, se redirige a `inicio.html`.

#### 7. Registro
Cuando presionas “Crear cuenta”:
- validas que las dos contraseñas coincidan,
- envías `nombre`, `correo`, `contrasena` a `api/registrar.php`,
- si funciona, se limpia el formulario y se vuelve al login.

---

## 5) `js/animacion-inicio.js`: cómo funciona la pantalla principal

Este archivo crea la experiencia visual inicial.

### A. Escena 3D de la Tierra
Usa `THREE.Scene()` para crear un escenario 3D. Luego:
- crea una cámara con perspectiva,
- crea un renderizador WebGL,
- agrega luz ambiente y luces direccionales,
- crea una esfera con una textura (`lib/tierra.jpg`),
- genera estrellas y un marcador.

La infraestructura es esta:

```js
const escena = new THREE.Scene();
const camara = new THREE.PerspectiveCamera(...);
const renderizador = new THREE.WebGLRenderer({ alpha: true, antialias: true });
```

### B. Animación del planeta
El archivo hace una animación continua:

```js
function animar() {
    requestAnimationFrame(animar);
    grupoTierra.rotation.y -= 0.0018;
    anilloMarcador.rotation.z += 0.012;
    estrellas.rotation.y += 0.00035;
    renderizador.render(escena, camara);
}
```

Eso crea el efecto de movimiento constante.

### C. Mapa de México
Con Leaflet se crea:

```js
mapa = L.map("mapaInicio", { ... }).setView([23.9, -102.5], 5);
```

Esto:
- centra el mapa en México,
- activa zoom, arrastre y toque,
- carga el mapa base de OpenStreetMap.

### D. Selección de estados
El archivo escucha el evento `miravia:estado-elegido` que viene de `selector-viaje.js`.

Cuando se elige un estado, hace esto:
- guarda el valor en una variable,
- muestra un chip con el nombre del estado,
- activa el botón “Comenzar viaje”,
- guarda el resultado en `localStorage`,
- hace un `flyTo` para mover el mapa hacia ese lugar.

### E. Botón “Comenzar viaje”
Cuando el usuario presiona el botón:
- se valida que ya haya elegido un estado,
- se prepara la navegación,
- se redirige a:

```js
vista/estados/estado.html?estado=... 
```

---

## 6) `js/selector-viaje.js`: mapa interactivo y selección de destino

Este archivo es el responsable de:
- crear los marcadores en el mapa de México,
- definir cada estado con coordenadas,
- detectar eventos de click,
- avisar al resto de la app qué estado eligió el usuario.

### Estado principal
La constante `ESTADOS` contiene 32 entradas, por ejemplo:

```js
{ valor: "oaxaca", nombre: "Oaxaca", coords: [17.07, -96.72], color: "#f4511e" }
```

Cada objeto tiene:
- `valor`: identificador del estado,
- `nombre`: nombre visible,
- `coords`: latitud y longitud,
- `color`: color del marcador.

### Función `estadoCercano(lat, lng)`
Calcula qué estado está más cerca del punto que tocó el usuario en el mapa. Usa una fórmula de distancia euclídea aproximada con ajuste por latitud.

### Función `seleccionarEstado(estado, marcador)`
Cuando el usuario hace clic:
- desmarca el marcador anterior,
- marca el nuevo,
- dispara un evento personalizado:

```js
document.dispatchEvent(new CustomEvent("miravia:estado-elegido", {
  detail: { valor: estado.valor, nombre: estado.nombre, coords: estado.coords, color: estado.color }
}));
```

Esto permite que otros scripts reaccionen sin depender directamente del mismo archivo.

---

## 7) `database/miravia.sql`: estructura de la base de datos

Este archivo define las tablas necesarias.

### `roles`
Guarda los tipos de usuario:
- admin
- editor
- usuario

### `usuarios`
La tabla principal:
- `id`
- `rol_id`
- `nombre`
- `correo`
- `contrasena`
- `activo`
- fechas de creación y actualización

La columna `correo` está marcada como única para impedir duplicados.

### `estados`
Guarda información sobre cada estado del país:
- slug
- nombre
- capital
- descripción
- lat/lng

### `municipios`
Relaciona cada estado con sus municipios.

### `atracciones`, `hoteles`, `restaurantes`
Guardan contenido turístico para mostrar en las páginas de cada destino.

También se insertan usuarios iniciales con credenciales de prueba:
- `admin@miravia.mx`
- `usuario@miravia.mx`

La contraseña se guarda ya hasheada con `password_hash`.

---

## 8) `vista/js/datos-estados.js`: la base de contenido turístico

Este es uno de los archivos más importantes de la app porque almacena la información de los destinos.

### Qué contiene
Por estado, tiene objetos con:
- nombre del estado,
- capital,
- coordenadas,
- descripción general,
- `hoteles`, `restaurantes`, `lugares`.

Ejemplo conceptual:

```js
chihuahua: {
  nombre: "Chihuahua",
  capital: "Chihuahua",
  coords: [28.63, -106.07],
  descripcion: "Las Barrancas del Cobre...",
  hoteles: [...],
  restaurantes: [...],
  lugares: [...]
}
```

Esto permite que la app muestre contenido diferente según el estado elegido, sin archivos HTML separados para cada destino.

---

## 9) `vista/estados/estado.html`: la página dinámica del estado

Esta page funciona como una plantilla reutilizable.

### Secciones visibles
- barra de navegación,
- hero del estado,
- buscador para lugares,
- mapa,
- sección de regiones,
- contenido del municipio,
- panel de hoteles/restaurantes,
- lugares turísticos.

### Qué hace el script interno
```js
const valorEstado = new URLSearchParams(location.search).get("estado") || "chiapas";
const datos = DATOS_ESTADOS.obtener(valorEstado);
```

Eso lee el parámetro `?estado=` de la URL y busca los datos del estado elegido. Si no existe, vuelve a la página principal.

Luego actualiza:
- el título de la pestaña,
- el nombre del estado,
- la descripción,
- el mapa del estado,
- los lugares populares,
- los hoteles y restaurantes.

---

## 10) CSS y personalización visual

La carpeta `estilo/` contiene estilos para:
- inicio (`inicio.css`),
- estados (`estado.css`),
- comida (`comida.css`),
- hoteles (`hoteles.css`),
- login (`login.css`),
- animaciones (`animacionTierra.css`), etc.

Estos archivos controlan:
- layouts,
- tamaños,
- colores,
- bordes,
- posición del mapa,
- animaciones de entrada,
- botones, cards y módulos.

---

## 11) Cómo funciona la autenticación real del sistema

El flujo completo es:

1. El usuario llena el formulario en `login.html`.
2. `js/login.js` llama a `api/auth.php`.
3. `auth.php` valida credenciales contra `usuarios`.
4. Si la contraseña es correcta, crea una sesión PHP.
5. La sesión queda guardada en el servidor.
6. `api/sesion.php` puede consultarla para saber si el usuario ya está autenticado.
7. El usuario puede navegar dentro de la app como “usuario logueado”.

La base de datos necesita MySQL y la app debe correr bajo Apache/PHP. El proyecto está preparado para usar:
- host: `127.0.0.1`
- base: `miravia_db`
- usuario: `root`

---

## 12) Resumen muy rápido de cada archivo importante

- `index.html` → redirige al inicio.
- `login.html` → pantalla de acceso.
- `inicio.html` → landing principal con mapa e interacción.
- `api/db.php` → conexión a MySQL.
- `api/auth.php` → login y sesión.
- `api/registrar.php` → alta de usuario.
- `api/sesion.php` → comprobar sesión.
- `js/login.js` → lógica de autenticación en navegador.
- `js/selector-viaje.js` → selección de estados.
- `js/animacion-inicio.js` → animación y mapa principal.
- `database/miravia.sql` → estructura de la base.
- `vista/js/datos-estados.js` → contenido de destinos.
- `vista/estados/estado.html` → página de cada estado.
- `estilo/*.css` → diseño visual.

---

## 13) Observaciones finales

MIRAVIA está estructurado como una aplicación web de frontend dinámico con un backend pequeño en PHP. No es una SPA completa con React/Vue, sino una app de páginas HTML + JS + PHP que se conecta con MySQL.

La idea central es clara:
- cada estado tiene su propia card de contenido,
- el mapa selecciona destinos,
- el usuario puede navegar por estados,
- la autenticación está protegida en PHP,
- la base de datos almacena usuarios y contenido.

Si quieres, la siguiente fase puede ser esta:
1. explicar línea por línea `login.js`,
2. explicar línea por línea `animacion-inicio.js`,
3. explicar línea por línea `auth.php`,
4. o incluso convertir esta documentación en comentarios dentro del código para que cada archivo esté autoexplicado.
