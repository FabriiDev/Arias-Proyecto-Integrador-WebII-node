import express, { text } from 'express';
import fetch from 'node-fetch';

// lib traduccion 
import translate from 'node-google-translate-skidz';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
//const port = 3000;

const port = process.env.PORT || 3000;

// Middleware para servir archivos estáticos

// app.use(express.static('public'));

app.use(express.static(__dirname + '/public/'));
/* middleware que parsea el body de la url. necesario para leer los datos enviados por el form*/
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Para manejar JSON
// -------------------------------------------------

// Ruta para servir el archivo HTML principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/departments', async (req, res) => {
    try {
        // Simula una respuesta de la API para departamentos
        const response = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/departments');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error al obtener departamentos:', error);
        res.status(500).send('Error al obtener departamentos');
    }
});

app.get('/api/objects/:id/images', async (req, res) => {
    const objectID = req.params.id;

    try {
        // Llamada a la API del Met Museum para obtener los datos del objeto
        const response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`);
        const data = await response.json();

        // Verificar si el objeto tiene datos válidos
        if (!data.objectID) {
            return res.status(404).json({ error: 'Objeto no encontrado' });
        }

        // Enviar la respuesta al cliente con los datos del objeto
        res.json(data);
    } catch (error) {
        console.error(`Error al obtener imágenes adicionales del objeto ${objectID}:`, error);
        res.status(500).json({ error: 'Error al obtener imágenes adicionales' });
    }
});

app.get("/traducir", (req, res) => {
    const cultura = req.body.cultura;
    const titulo = req.body.titulo;
    const dinastia = req.body.dinastia;

    translate({
        text: req.params.texto,
        source: 'en',
        target: 'es'
    }, function (result) {
        res.json({ textoTraducido: result.translation });
    })
})

// --> post

app.post("/busqueda-general", async (req, res) => {
    try {
        let url = req.body.url;
        let ids = await traerIds(url);
        
        // Limitar a un máximo de 200 IDs
        ids = ids.slice(0, Math.min(ids.length, 150));
        
        // Fetch a cada ID
        let objetos = await objetosPromise(ids);
        
        // Realizar traducción
        await traduccion(objetos);
        
        res.json(objetos);
        
    } catch (error) {
        console.error('Error en /busqueda-general: ', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// ----------------------------------

async function traerIds(url) {
    try {
        const respuesta = await fetch(url);
        if (respuesta.ok) {
            const datos = await respuesta.json();
            return datos.objectIDs || [];
        }
        return [];
    } catch (error) {
        console.log('Error en traerIds: ', error);
        return [];
    }
}

// ----------------------------------------------- 

async function objetosPromise(ids) {
    if (ids.length === 0) {
        console.log("No se encontró ningún elemento");
        return [];
    }

    const promesas = ids.map(async (id) => {
        try {
            const respuesta = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
            if (!respuesta.ok) return null;
            return await respuesta.json();
        } catch (error) {
            console.log('Error en objetosPromise: ', error);
            return null;
        }
    });

    const resultados = await Promise.all(promesas);
    return resultados.filter(resultado => resultado !== null);
}

// --> traduccion

async function traduccion(objetos) {
    const promises = objetos.map(async (element) => {
        const translations = {};
        
        if (element.title) translations.title = element.title;
        if (element.dynasty) translations.dynasty = element.dynasty;
        if (element.culture) translations.culture = element.culture;

        // Solo realizar traducciones si hay texto para traducir
        const translationPromises = Object.entries(translations).map(([key, texto]) =>
            translate({ text: texto, source: "en", target: "es" }).then(result => {
                element[key] = result.translation;
            })
        );

        await Promise.all(translationPromises);
    });

    await Promise.all(promises);
}

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});


// ---------------------------------- primeros intentos de gets ---------------------------------
/*
app.get('/api/objects/:id', async (req, res) => {
    const objectID = req.params.id;
    try {
        const response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(`Error al obtener objeto ${objectID}:`, error);
        res.status(500).send(`Error al obtener objeto ${objectID}`);
    }
}); 

// Ruta para obtener todos los objetos
app.get('/api/objects', async (req, res) => {
    try {
        const response = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/objects');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los objetos' });
    }
});


*/