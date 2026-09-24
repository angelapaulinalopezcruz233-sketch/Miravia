const ubicacionTitulo =
    document.getElementById(
        "ubicacionTitulo"
    );


const coordenadas =
    document.getElementById(
        "coordenadas"
    );


if ("geolocation" in navigator) {


    navigator.geolocation.watchPosition(

        function(posicion) {

            const lat =
                posicion.coords.latitude;

            const lon =
                posicion.coords.longitude;

            const precision =
                posicion.coords.accuracy;


            console.log(
                "Latitud:",
                lat
            );


            console.log(
                "Longitud:",
                lon
            );


            ubicacionTitulo.textContent =
                "Ubicación encontrada";


            coordenadas.textContent =
                `Lat: ${lat.toFixed(5)} | Lon: ${lon.toFixed(5)}`;


            window.dispatchEvent(

                new CustomEvent(
                    "ubicacionActualizada",

                    {

                        detail: {

                            lat: lat,

                            lon: lon,

                            precision:
                                precision

                        }

                    }

                )

            );

        },


        function(error) {

            console.error(error);


            ubicacionTitulo.textContent =
                "Ubicación no disponible";


            coordenadas.textContent =
                "Permite la ubicación en tu navegador";

        },


        {

            enableHighAccuracy:
                true,

            maximumAge:
                5000,

            timeout:
                10000

        }

    );

}