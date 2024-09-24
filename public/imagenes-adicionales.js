// Obtener los parámetros de la URL
const urlParams = new URLSearchParams(window.location.search);
const objetoId = urlParams.get('objeto');
const titulo = urlParams.get('titulo');
const cultura = urlParams.get('cultura') || 'No tiene cultura';
const dinastia = urlParams.get('dinastia') || 'No tiene dinastia';
const creacion = urlParams.get('creacion') || 'No se sabe';

const cargarImgAd = async () => {
    try {
        // Llamar a la nueva ruta del servidor para obtener los datos del objeto
        const rta = await fetch(`/api/objects/${objetoId}/images`);
        const data = await rta.json();

        // Verificar si hay algún error en la respuesta
        if (rta.status !== 200) {
            throw new Error(data.error || 'Error al obtener datos del objeto');
        }

        let tit = '';
        

        tit = `<div>
            <h1>${titulo}</h1>
            <p class="cult-dinas">Cultura: ${cultura}</p>
            <p class="cult-dinas">Dinastia: ${dinastia}</p>
            <p class="cult-dinas">Creación: ${creacion}</p>
        </div>`;
        document.getElementById('textos').innerHTML = tit;

        // Agregar las imágenes adicionales
        data.additionalImages.forEach(element => {
            const img = document.createElement('img');
            img.src = element;
            img.classList.add('img-individual');
            document.getElementById('img-container').appendChild(img);
        });
    } catch (error) {
        console.error('Error al cargar imágenes adicionales:', error);
    }
};

cargarImgAd();
