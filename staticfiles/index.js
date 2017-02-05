'use strict'

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3001, host: 'localhost'});

server.register(require('inert'), (err) => {
    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/hello',
        handler: function (request, reply) {
            reply.file('./public/hello.html');
        }
    });
});

server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    reply(`Hello World!`);
  }
});

server.route({
  method: 'GET',
  path: '/{name}',
  handler: function (request, reply) {
    reply('Hello, '+ encodeURIComponent(request.params.name)+ '!');
  }
});

server.start((err) => {

  if (err) {
    throw err;
  }
  console.log(`Server runn ing at : ${server.info.uri}`);
});