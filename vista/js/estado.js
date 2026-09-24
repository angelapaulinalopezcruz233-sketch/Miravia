const estado = document.getElementById("estado");

const municipio = document.getElementById("municipio");

const botonExplorar = document.getElementById("btnExplorar");



/* =====================================
   CAMBIAR MUNICIPIOS
===================================== */

estado.addEventListener("change", function () {

    municipio.innerHTML = "";



    if (estado.value === "oaxaca") {

        municipio.innerHTML = `
        
            <option value="">
                Selecciona un municipio
            </option>

            <option value="oaxaca-de-juarez">
                Oaxaca de Juárez
            </option>

        `;

    }


    else if (estado.value === "quintana-roo") {

        municipio.innerHTML = `

            <option value="">
                Selecciona un municipio
            </option>

            <option>
                Benito Juárez
            </option>

        `;

    }


    else if (estado.value === "guanajuato") {

        municipio.innerHTML = `

            <option value="">
                Selecciona un municipio
            </option>

            <option>
                Guanajuato
            </option>

            <option>
                San Miguel de Allende
            </option>

        `;

    }


    else if (estado.value === "jalisco") {

        municipio.innerHTML = `

            <option value="">
                Selecciona un municipio
            </option>

            <option>
                Puerto Vallarta
            </option>

        `;

    }

});



/* =====================================
   BOTÓN EXPLORAR
===================================== */

botonExplorar.addEventListener("click", function () {


    if (
        estado.value === "oaxaca" &&
        municipio.value === "oaxaca-de-juarez"
    ) {

        window.location.href =
            "../pagina/oaxaca-de-juarez.html";

    }


    else {

        alert(
            "Selecciona Oaxaca y Oaxaca de Juárez para continuar."
        );

    }

});