// static files need amn external package "inert"

'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3000, host: 'localhost' });

server.register(require('inert'), (err) => {

    if(err) {
        throw err;
    }

    server.route({
        method: `GET`,
        path: `/bootstrap.css`,
        handler: function (request, reply) {
            reply.file(`../public/bootstrap.css`);
        }
    });
});

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});