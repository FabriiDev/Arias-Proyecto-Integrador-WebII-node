# Práctico Integrador Web II - Página de Consulta de Obras de Arte del Museo Metropolitano de NY

## Descripción

Este proyecto consiste en una página web que consume imágenes y datos de objetos de arte del Museo Metropolitano de Nueva York (Metropolitan Museum of Art) utilizando su API oficial: [API del Museo Metropolitano](https://collectionapi.metmuseum.org). La aplicación permite a los usuarios buscar y filtrar objetos de arte de acuerdo con varios criterios, como el departamento, la palabra clave y la localización, y mostrar los resultados en una cuadrícula.

### Funcionalidades principales:
- **Búsqueda por Filtros**: El usuario puede buscar objetos por:
  - Departamento (Ej. American Decorative Arts, Arms and Armor, Asian Art, etc.)
  - Palabra clave (Ej. Buscar objetos de arte que contengan una palabra clave en sus datos)
  - Localización (Ej. Europe, China, Paris)
  
- **Grilla de imágenes**: Los objetos de arte se muestran en una grilla de 4 columnas, con información relevante como:
  - Título
  - Cultura
  - Dinastía

- **Interactividad**:
  - Al pasar el ratón por encima de la imagen de un objeto, se muestra la fecha de creación o una aproximación.
  - Si un objeto tiene imágenes adicionales, se presenta un botón que redirige a una página diferente para verlas.

- **Paginación**: Si los resultados de búsqueda superan los 20 objetos, se muestra un sistema de paginación para navegar entre los resultados.

- **Traducción de datos**: La información de título, cultura y dinastía se muestra en español utilizando la API de traducción de Google.

---

## Requisitos

Para ejecutar este proyecto en tu máquina local, asegúrate de tener los siguientes requisitos:

- **Node.js**: Versión >= 14.x
- **npm** o **yarn** para gestionar las dependencias.

---
