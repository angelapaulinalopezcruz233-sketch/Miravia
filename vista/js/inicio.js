import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


/* =========================================
   ELEMENTOS HTML
========================================= */

const contenedor =
    document.getElementById("tierra");

const titulo =
    document.getElementById("titulo");

const subtitulo =
    document.getElementById("subtitulo");

const textoUbicacion =
    document.getElementById("textoUbicacion");

const boton =
    document.getElementById("btnComenzar");


/* =========================================
   ESCENA
========================================= */

const escena =
    new THREE.Scene();


/* =========================================
   CÁMARA
========================================= */

const camara =
    new THREE.PerspectiveCamera(

        45,

        window.innerWidth /
        window.innerHeight,

        0.1,

        1000

    );


/* COMENZAMOS LEJOS */

camara.position.z = 10;


/* =========================================
   RENDERIZADOR
========================================= */

const renderizador =
    new THREE.WebGLRenderer({

        antialias: true

    });


renderizador.setSize(

    window.innerWidth,

    window.innerHeight

);


renderizador.setPixelRatio(

    Math.min(
        window.devicePixelRatio,
        2
    )

);


contenedor.appendChild(

    renderizador.domElement

);


/* =========================================
   LUCES
========================================= */

const luzAmbiente =
    new THREE.AmbientLight(

        0xffffff,

        1.3

    );


escena.add(luzAmbiente);


const luzSol =
    new THREE.DirectionalLight(

        0xffffff,

        3

    );


luzSol.position.set(

    5,
    3,
    5

);


escena.add(luzSol);


/* =========================================
   TIERRA
========================================= */

const geometriaTierra =
    new THREE.SphereGeometry(

        2,

        128,

        128

    );


const texturaTierra =
    new THREE.TextureLoader().load(

        "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"

    );


const materialTierra =
    new THREE.MeshPhongMaterial({

        map: texturaTierra

    });


const tierra =
    new THREE.Mesh(

        geometriaTierra,

        materialTierra

    );


escena.add(tierra);


/* =========================================
   ESTRELLAS
========================================= */

const geometriaEstrellas =
    new THREE.BufferGeometry();


const posiciones = [];


for (
    let i = 0;
    i < 4000;
    i++
) {

    posiciones.push(

        (Math.random() - .5) * 400,

        (Math.random() - .5) * 400,

        (Math.random() - .5) * 400

    );

}


geometriaEstrellas.setAttribute(

    "position",

    new THREE.Float32BufferAttribute(

        posiciones,

        3

    )

);


const materialEstrellas =
    new THREE.PointsMaterial({

        color: 0xffffff,

        size: .08

    });


const estrellas =
    new THREE.Points(

        geometriaEstrellas,

        materialEstrellas

    );


escena.add(estrellas);


/* =========================================
   MARCADOR DE UBICACIÓN
========================================= */

let marcador = null;


function crearMarcador() {

    const geometria =
        new THREE.SphereGeometry(

            .08,
            20,
            20

        );


    const material =
        new THREE.MeshBasicMaterial({

            color: 0xff3333

        });


    marcador =
        new THREE.Mesh(

            geometria,
            material

        );


    marcador.visible = false;

    tierra.add(marcador);

}


/* =========================================
   CONVERTIR COORDENADAS
   LATITUD / LONGITUD
   A PUNTO SOBRE LA TIERRA
========================================= */

function coordenadasEnTierra(

    latitud,
    longitud

) {

    const lat =
        latitud *
        Math.PI / 180;


    const lon =
        longitud *
        Math.PI / 180;


    const radio = 2.05;


    const x =
        radio *
        Math.cos(lat) *
        Math.sin(lon);


    const y =
        radio *
        Math.sin(lat);


    const z =
        radio *
        Math.cos(lat) *
        Math.cos(lon);


    return new THREE.Vector3(

        x,
        y,
        z

    );

}


/* =========================================
   ORIENTAR TIERRA HACIA UBICACIÓN
========================================= */

function orientarHacia(

    latitud,
    longitud

) {

    const punto =
        coordenadasEnTierra(

            latitud,
            longitud

        );


    const direccion =
        punto.clone().normalize();


    const objetivo =
        new THREE.Vector3(

            0,
            0,
            1

        );


    const quaternion =
        new THREE.Quaternion();


    quaternion.setFromUnitVectors(

        direccion,

        objetivo

    );


    tierra.quaternion.copy(

        quaternion

    );


    return punto;

}


/* =========================================
   UBICACIÓN DEL USUARIO
========================================= */

let usuarioLatitud = null;

let usuarioLongitud = null;

let ubicacionEncontrada = false;


/* =========================================
   GEOLOCALIZACIÓN
========================================= */

if ("geolocation" in navigator) {

    navigator.geolocation.getCurrentPosition(

        function(posicion) {

            usuarioLatitud =
                posicion.coords.latitude;

            usuarioLongitud =
                posicion.coords.longitude;

            ubicacionEncontrada = true;


            console.log(
                "Latitud:",
                usuarioLatitud
            );


            console.log(
                "Longitud:",
                usuarioLongitud
            );


            textoUbicacion.textContent =
                "Ubicación encontrada";


        },

        function(error) {

            console.log(
                "No se pudo obtener la ubicación",
                error
            );


            textoUbicacion.textContent =
                "No se pudo obtener tu ubicación";

        },

        {

            enableHighAccuracy: true,

            maximumAge: 0,

            timeout: 15000

        }

    );

}


/* =========================================
   CREAR MARCADOR
========================================= */

crearMarcador();


/* =========================================
   CONTROL DE ANIMACIÓN
========================================= */

let tiempo = 0;

let etapa = 0;


/*
ETAPA 0
ESPACIO


ETAPA 1
TIERRA


ETAPA 2
MÉXICO


ETAPA 3
UBICACIÓN


ETAPA 4
MENSAJE
*/


/* =========================================
   ANIMACIÓN
========================================= */

function animar() {

    requestAnimationFrame(animar);


    tiempo += 0.01;


    /* =====================================
       ESTRELLAS
    ===================================== */

    estrellas.rotation.y += 0.0001;


    /* =====================================
       ETAPA 0
       ESPACIO
    ===================================== */

    if (tiempo < 2) {

        etapa = 0;

        titulo.textContent =
            "Bienvenido a Miravia";

        subtitulo.textContent =
            "Un viaje comienza mucho antes de llegar";

    }


    /* =====================================
       ETAPA 1
       APARECE LA TIERRA
    ===================================== */

    else if (tiempo < 6) {

        etapa = 1;

        titulo.textContent =
            "Descubre el mundo";

        subtitulo.textContent =
            "Preparando tu experiencia de viaje";


        tierra.rotation.y += 0.004;


        if (
            camara.position.z > 6
        ) {

            camara.position.z -=
                0.015;

        }

    }


    /* =====================================
       ETAPA 2
       MÉXICO
    ===================================== */

    else if (tiempo < 11) {

        etapa = 2;

        titulo.textContent =
            "México";

        subtitulo.textContent =
            "Un país lleno de lugares por descubrir";


        tierra.rotation.y += 0.002;


        if (
            camara.position.z > 4.5
        ) {

            camara.position.z -=
                0.01;

        }

    }


    /* =====================================
       ETAPA 3
       UBICACIÓN
    ===================================== */

    else if (
        tiempo < 17 &&
        ubicacionEncontrada
    ) {

        etapa = 3;

        titulo.textContent =
            "Localizando tu posición";

        subtitulo.textContent =
            "Acercándonos a ti";


        const punto =
            orientarHacia(

                usuarioLatitud,

                usuarioLongitud

            );


        if (marcador) {

            marcador.position.copy(

                punto

            );

            marcador.visible = true;

        }


        if (
            camara.position.z > 3.1
        ) {

            camara.position.z -=
                0.01;

        }

    }


    /* =====================================
       ETAPA 4
       MENSAJE FINAL
    ===================================== */

    else if (
        tiempo >= 17 &&
        ubicacionEncontrada
    ) {

        etapa = 4;


        titulo.textContent =
            "¡Ya estás aquí!";


        subtitulo.textContent =
            "El mundo está lleno de lugares esperando por ti";


        textoUbicacion.textContent =
            "Tu ubicación ha sido localizada";


        boton.classList.add(
            "mostrar"
        );

    }


    /* =====================================
       SI NO HAY UBICACIÓN
    ===================================== */

    else if (
        tiempo >= 17 &&
        !ubicacionEncontrada
    ) {

        titulo.textContent =
            "Queremos llevarte más lejos";


        subtitulo.textContent =
            "Permite tu ubicación para descubrir lugares cerca de ti";


        boton.classList.add(
            "mostrar"
        );

    }


    /* =====================================
       RENDER
    ===================================== */

    renderizador.render(

        escena,

        camara

    );

}


/* =========================================
   INICIAR
========================================= */

animar();


/* =========================================
   BOTÓN
========================================= */

boton.addEventListener(

    "click",

    function() {

        window.location.href =
            "index.html";

    }

);


/* =========================================
   REDIMENSIONAR
========================================= */

window.addEventListener(

    "resize",

    function() {

        camara.aspect =

            window.innerWidth /
            window.innerHeight;


        camara.updateProjectionMatrix();


        renderizador.setSize(

            window.innerWidth,

            window.innerHeight

        );

    }

);