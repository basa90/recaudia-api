# Recaudia-API
RESTful API, basada en Node.js, Express y Postgresql.
Permiten la gestión eficiente y efectiva de cobros tanto únicos, como recurrentes entre sus clientes y los clientes de sus clientes.


## Instalación

1. Instalar Postgres 9.5.
2. Hacer restore de la base de datos (El archivo se encuentra en la carpeta DBscript).
3. El Frontend se encuentra en [recaudiaFrontend](https://github.com/basa90/recaudia), debe hacer clone del proyecto y ubicarlo en la carpeta Apps
4. Situarse en la carpeta recaudia-api y ejecutar el siguiente comando
```
npm install
```



## Uso

Para correr el servidor debe ejecutar el siguiente comando en caso que se encuentre en productivo
```
npm start
```
En caso que se encuentre en un ambienrte de desarrollo ejecutar
```
npm run start-dev
```

## Implementado con

* [Node.js](http://nodejs.org/) - Node.js® es un entorno de ejecución para JavaScript construido con el motor de JavaScript V8 de Chrome.
* [Express](http://expressjs.com/) - Express es una infraestructura de aplicaciones web Node.js mínima y flexible.
* [pg-promise](https://github.com/vitaly-t/pg-promise) - interface for PostgreSQL.

## Créditos
- [Brayan Salas](https://twitter.com/basa90)

## Licencia
[MIT](https://opensource.org/licenses/MIT)
