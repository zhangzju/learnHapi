"use strict"

// const Bcrypt = require('bcrypt');
const Hapi = require('hapi');
const Basic = require('hapi-auth-basic');

const server = new Hapi.Server();
server.connection({port: 3006});

const users= {
    zhang: {
        username: 'zhang',
        password: 'secret', //secret
        name: 'zhang',
        id: '123456'
    }
};

const validate = function (request, username, password, callback) {
    const user = users[username];
    if(!user) {
        return callback(null, false);
    }


    if (password === user.password) {
        let err=null;
        let isValid=true;
        callback(err, isValid, {id: user.id, name: user.name});
    }
};

server.register(Basic, (err) => {

    if (err) {
        throw err;
    }

    server.auth.strategy('simple', 'basic', {validateFunc: validate});
    server.route({
        method: 'GET',
        path: '/',
        config: {
            auth: 'simple',
            handler: function (request, reply) {
                reply('hello, '+ request.auth.credentials.name);
            }
        }
    });

    server.start((err) => {

        if(err) {
            throw err;
        }

        console.log('server running at: '+ server.info.uri);
    });
});