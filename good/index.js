'use strict'

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({port: 3005});

server.route([{
    method: 'GET',
    path: '/',
    handler: (req, reply)=>{
        reply('Hello World');
    }
},{
    method: 'GET',
    path: '/json',
    handler: (req, reply)=>{
        reply({ hello: 'world'});
    }
}]);

//Register the good plugin

server.register({
    register: require('good'),
    options: {
        reporters: {
            myConsoleReporter: [{
                module: 'good-console'
            }, 'stdout']
        }
    }
}, (err) => {

    if (err) {
        throw err;
    }

    server.start((err) => {
        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    })
})