let departametazos = `<option value="nada">Seleccione uno</option>`;
let aleatorio;
let tarjetas = '';
let objetitos = [];
var objGlobal = [];
let indexPagina;

// -------------------------------------------ANIMACION DE CARGA ----------------------------------------------------------
const loader = document.getElementById("carga");
const showLoader = () => {
    loader.classList.add("show-carga");
}
const hideLoader = () => {
    loader.classList.remove("show-carga");
}
// ------------------------------------------------------------------------------------------------------------------------

/* ---------------------------------------------CREAR TARJETA-------------------------------------------------------------------- */
// esto me mato para hcer la paginacion, lo tuve quue comentar
// const títulosMostrados = new Set();

function crearTarjeta(obraDeArte) {

    let imagen = obraDeArte.primaryImageSmall;
    let fechaImagen = obraDeArte.objectDate || "No hay registros";
    let dinastia = obraDeArte.dynasty || "No tiene";
    let cultura = obraDeArte.culture || "No se sabe";
    let titulo = obraDeArte.title;
    let tarjetaHTML;
    console.log('creando tarjetas');

    // ----------------------------------------------------------------------------------------- 
    // Verifica si el título ya ha sido mostrado
    // if (títulosMostrados.has(titulo)) {
    //     return false; // No crear tarjeta si el título ya ha sido mostrado
    // }
    // títulosMostrados.add(titulo); // Añadir el título al conjunto
    // ----------------------------------------------------------------------------------------- 

    // Crear la tarjeta HTML
    if (obraDeArte.primaryImageSmall != '') {
        if (obraDeArte.additionalImages == '') {
            tarjetaHTML = `
        <div class="tarjeta">
            <img src="${imagen}" alt="" title="${fechaImagen}" class="img-targeta"></img>
            <h4 class="titulo-tarjeta">${titulo}</h4>
            <p class="texto-tarjeta">Cultura: ${cultura}</p>
            <p class="texto-tarjeta">Dinastia: ${dinastia}</p>
        </div>
    `;
            document.getElementById('cont_tarjeta').innerHTML += tarjetaHTML;
        } else {
            tarjetaHTML = `
        <div class="tarjeta">
            <img src="${imagen}" alt="" title="${fechaImagen}" class="img-targeta"></img>
            <h4 class="titulo-tarjeta">${titulo}</h4>
            <p class="texto-tarjeta">Cultura: ${cultura}</p>
            <p class="texto-tarjeta">Dinastia: ${dinastia}</p>
            <a href="imagenes-adicionales.html?objeto=${obraDeArte.objectID}&titulo=${encodeURIComponent(obraDeArte.title)}&cultura=${encodeURIComponent(obraDeArte.culture)}&dinastia=${encodeURIComponent(obraDeArte.dynasty)}&creacion=${encodeURIComponent(obraDeArte.objectDate)}">Ver más</a>

            
        </div>
    `;
            document.getElementById('cont_tarjeta').innerHTML += tarjetaHTML;
        }
    } else {
        return;
    }

    // Añadir la tarjeta al contenedor
    //document.getElementById('cont_tarjeta').innerHTML += tarjetaHTML;
    
    return true; // Indica que la tarjeta fue creada exitosamente
}
// ------------------------------------------ crear botones paginacion ---------------------------------------------------------
function botonesDeBajoTar(){
    let btns =  '<a href="#arriba"> <button onclick="anterior()"> Anterior </button> </a> <a href="#arriba"> <button onclick="siguiente()"> Siguiente </button> </a>'
    document.getElementById('btn_debajo').innerHTML = btns;

}

// ---------------------------------------------------- llenar combo departamentos ---------------------------------------------
const cargarDepas = async () => {
    try {
        const respuesta = await fetch('/api/departments');

        if (respuesta.status === 200) {
            const museo = await respuesta.json();

            museo.departments.forEach(element => {
                departametazos += `<option value="${element.departmentId}">${element.displayName}</option>`;
            });

            document.getElementById("combo").innerHTML = departametazos;

        } else if (respuesta.status === 404) {
            console.log("Lo que buscas no existe");
        } else {
            console.log("algo salio mal... Status: " + respuesta.status);
        }
    } catch (error) {
        console.log(error);
    }
}
cargarDepas();
// -----------------------------------------------------------------------------------------------------------------------------------

//--------------------------------------- TOMAR EL VALOR DE LA SELECCION DEL DROP --------------------------------------------------
let seleccion = 'nada';
let depa;

document.getElementById("combo").addEventListener("change", async (event) => {
    seleccion = event.target.value; // Obtén el valor de la opción seleccionada
    console.log("Valor seleccionado: " + seleccion);
    depa = seleccion;
});
// -----------------------------------------------------------------------------------------------------------------------------------

// ------------------------------------------ tomar la geolocation del input ---------------------------------------------------------
let loca = '';

document.getElementById("combo-loc").addEventListener("change", async (event) => {
    loca = event.target.value; // Obtén el valor de la opción seleccionada
    console.log("Valor seleccionado: " + loca);
});
//------------------------------------------------------------------------------------------------------------------------------------

//---------------------------------------------------------- Buscar palabra clave -----------------------------------------------------
let palabra;
function leerPalabra() {
    palabra = document.getElementById("palabra").value;
    console.log(palabra);
}
// -------------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------- Boton buscar ----------------------------------------------------------------
async function buscar() {
    tarjetas = '';
    const url = tipoDeFiltro();
    console.log("URL de búsqueda:", url);
    showLoader(); // mostrar cargando
    // await filtroGeneral(url);
    // ------------------------------------------- 

    fetch("/", {
        method: "POST", // método HTTP
        headers: {
            "Content-Type": "application/json", // tipo de contenido
        },
        body: JSON.stringify({ url }), // Enviar solo la URL como objeto JSON
        //esprea el json desde el server
    })
        .then((respuesta) => respuesta.json())
        .then((datos) => {
            document.getElementById("cont_tarjeta").innerHTML = "";
            // le paso a la paginacion los objetos que solo tengan las primary image small, asi no quedan huecos randoms en las tarjetas
            const objetosConImagen = datos.filter(objeto => objeto.primaryImageSmall);
            objGlobal = paginas(objetosConImagen);
            indexPagina = 0;
            document.getElementById("ver_paginas").innerHTML = `pagina:${indexPagina + 1} de ${objGlobal.length}`;
            for (const element of objGlobal[0]) {
                crearTarjeta(element);
            }
            hideLoader();
            botonesDeBajoTar();

        });

}

// ------------------------------------------------------- paginacion creo que terminada -----------------------------------------------------

function paginas(obj) {
    let tam = 20;
    const arrayVeinte = [];
    
   
    for (let i = 0; i < obj.length; i += tam) {
        arrayVeinte.push(obj.slice(i, i + tam));
    }
    return arrayVeinte;
}

function siguiente() {
    indexPagina++;
    if (indexPagina > objGlobal.length - 1) {
        indexPagina = objGlobal.length - 1;
    }
    document.getElementById("cont_tarjeta").innerHTML = "";
    document.getElementById("ver_paginas").innerHTML = `pagina:${indexPagina + 1} de ${objGlobal.length}`;
    for (const element of objGlobal[indexPagina]) {
        crearTarjeta(element);
    }
}

function anterior() {
    indexPagina--;
    if (indexPagina < 0) {
        indexPagina = 0;
    }
    document.getElementById("cont_tarjeta").innerHTML = "";
    document.getElementById("ver_paginas").innerHTML = `pagina:${indexPagina + 1} de ${objGlobal.length}`;
    for (const element of objGlobal[indexPagina]) {
        crearTarjeta(element);
    }

}

//-------------------------------------------------------TIPO DE FILTRADO------------------------------------------------------------------------
function tipoDeFiltro() {
    let dpt = seleccion
    let palabra = document.getElementById('palabra').value
    let lcl = loca
    let url;

    if (dpt !== 'nada' && palabra !== '' && lcl !== '') {
        console.log('aca?')
        url = `https://collectionapi.metmuseum.org/public/collection/v1/search?geoLocation=${lcl}&q=${palabra}&DepartmentId=${dpt}`;
        return url;
    } else if (dpt !== 'nada' && lcl !== '') {
        console.log('asddddddddddddddddddddd')
        url = `https://collectionapi.metmuseum.org/public/collection/v1/search?geoLocation=${lcl}&q=*&DepartmentId=${dpt}`;
        return url;
    } else if (dpt !== 'nada' && palabra !== '') {
        url = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${palabra}&DepartmentId=${dpt}`;
        return url;
    } else if (lcl !== '' && palabra !== '') {
        url = `https://collectionapi.metmuseum.org/public/collection/v1/search?geoLocation=${lcl}&q=${palabra}`;
        return url;
    } else if (dpt !== 'nada') {
        url = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=*&DepartmentId=${dpt}`;
        return url;
    } else if (lcl !== '') {
        url = `https://collectionapi.metmuseum.org/public/collection/v1/search?geoLocation=${lcl}&q=*`;
        return url;
    } else if (palabra !== '') {
        url = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${palabra}`;
        return url;
    } else {
        url = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=*`;
        return url;
    }
}

//-----------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------- PRIMERA PRUEBA DE FILTROS ---------------------------------------------------
/*
const filtroGeneral = async (url) => {
    try {
        const rta = await fetch(url);
        if (!rta.ok) throw new Error('Error al obtener objetos filtrados');

        const datos = await rta.json();
        console.log("Datos filtrados:", datos);

        tarjetas = '';
        objetitos = datos.objectIDs || [];

        // Limpiar el contenedor de tarjetas
        document.getElementById('cont_tarjeta').innerHTML = '';

        for (const objectID of objetitos) {
            try {
                const rtaObjeto = await fetch(`/api/objects/${objectID}`);
                if (!rtaObjeto.ok) throw new Error(`Error al obtener objeto ${objectID}`);

                const objeto = await rtaObjeto.json();

                if (objeto.primaryImageSmall) {
                    crearTarjeta(objeto);
                }
            } catch (error) {
                console.error(`al obtener detalles del objeto ${objectID}: `, error);
            }
        }
    } catch (error) {
        console.error("Error al aplicar filtro general:", error);
    }
};
*/
// -------------------------------------------------------------------------------------------------------------------\



/*--------------------------------------------------------------------------------------------------------------------------*/

// -----------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------ CONTENIDO PAGINA PRINCIPAL ----------------------------------------------------
/* const ventanaPrincipal = async () => {
    try {
        const rta = await fetch("/api/objects");
        const datos = await rta.json();
        const objectIDs = datos.objectIDs; // Lista de todos los objectIDs

        // Limpiar el contenedor de tarjetas antes de añadir nuevas
        document.getElementById('cont_tarjeta').innerHTML = '';

        let tarjetasCreadas = 0; // Contador para el número de tarjetas creadas

        // Usar un conjunto para asegurarse de que los objectIDs no se repitan
        const idsUsados = new Set();

        while (tarjetasCreadas < 20 && idsUsados.size < objectIDs.length) {

            const aleatorio = Math.floor(Math.random() * 10000 + 1);
            const objectID = objectIDs[aleatorio];

            // Evitar duplicados
            if (idsUsados.has(objectID)) {
                continue; // Si ya usamos este ID, pasar al siguiente
            }
            idsUsados.add(objectID);

            try {
                // Hacer solicitud para obtener detalles del objeto
                const rtaObjeto = await fetch(`/api/objects/${objectID}`);
                const objeto = await rtaObjeto.json();

                // Verificar si el objeto tiene una imagen
                console.log('imagen: ', objeto.primaryImageSmall)
                console.log('id: ', objeto.objectID)
                if (objeto.primaryImageSmall) {
                    crearTarjeta(objeto);

                    // Incrementar contador de tarjetas creadas
                    tarjetasCreadas++;
                }
            } catch (error) {
                console.error(`Error al obtener los detalles del objeto ${objectID}:`, error);
            }
        }

    } catch (error) {
        console.error("Error al cargar la ventana principal:", error);
    }
};

// Cargar la ventana principal
const cargarVentanaPrincipal = async () => {
    showLoader(); // Mostrar cargando

    await ventanaPrincipal();

    hideLoader(); // Ocultar cargando
};

//cargarVentanaPrincipal(); */
// -----------------------------------------------------------------------------------------------------------------------------