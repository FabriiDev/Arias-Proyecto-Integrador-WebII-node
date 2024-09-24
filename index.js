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

app.post("/", async (req, res) => {
    try {
       
        let url = req.body.url;
        let ids = await traerIds(url);
        
        //trae unicamente 500
        ids = ids.slice(0, Math.min(ids.length, 200));
        //fetch a cada id
        let objetos = await objetosPromise(ids);
        await traduccion(objetos);
        
        res.json(objetos);
        
    } catch (error) {
        console.log('error: ', error)
    }
});


// ----------------------------------

async function traerIds(url) {
    let idObj
    let respuesta
    try {
        idObj = ["lil shit"];
        respuesta = await fetch(url);
        //checkeamos que no se halla reventado la api o nos tire un 404
        if (respuesta.ok) {
            let datos = await respuesta.json();
            idObj = datos.objectIDs;
        }
        
        return idObj;
    } catch (error) {
        console.log('eror traerid- ', error, idObj)
    }
}

// ----------------------------------------------- 

async function objetosPromise(ids) {
    if (ids.length > 0) {
        let promesas = ids.map(async (ids) => {
            try {
                let respuesta = await fetch(
                    `https://collectionapi.metmuseum.org/public/collection/v1/objects/${ids}`
                );
                if (!respuesta.ok) {
                    return null;
                }

                let object = await respuesta.json();
                return object;
            } catch (error) {
                return null;
            }
        });
        let resultados = await Promise.all(promesas);

        let objetos = resultados.filter((resultado) => resultado !== null);
        return objetos;
    } else {
        console.log("no se encontro ningun elemento");
    }
}

// --> traduccion

async function traduccion(objetos) {
    for (const element of objetos) {
        const promises = [];

        if (element.title) {
            let texto = element.title;
            promises.push(
                translate({
                    text: texto,
                    source: "en",
                    target: "es",
                }).then((result) => {

                    element.title = result.translation;
                    console.log(element.title)
                })
            );
        }

        if (element.dynasty) {
            let texto = element.dynasty;
            promises.push(
                translate({
                    text: texto,
                    source: "en",
                    target: "es",
                }).then((result) => {
                    element.dynasty = result.translation;
                })
            );
        }

        if (element.culture) {
            let texto = element.culture;
            promises.push(
                translate({
                    text: texto,
                    source: "en",
                    target: "es",
                }).then((result) => {
                    element.culture = result.translation;
                })
            );
        }

        // todas las promesas de forma asincronica
        await Promise.all(promises);

    }
}

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});