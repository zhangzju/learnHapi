'use strict'

const Hapi = require('hapi');
const Sqlite3 = require('sqlite3');

const db = Sqlite3.Database('./dingdin.sqlite');
const server = new Hapi.Server();
server.connection({ port: 4000});

server.route([{
    method: 'GET',
    path: '/api/recipes',
    handler: (res, reply)=> {
        db.all('SELECT * FROM recipes', (err, results)=>{

            if(err) {
                throw err;
            }

            reply(results);
        });
    }
}]);

server.start((err)=>{

    if(err) {
        throw err;
    }

    console.log('Server running at:', server.info.uri);
});