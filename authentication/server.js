"use strict"

const Bcrypt = require('bcrypt');
const Hapi = require('hapi');
const Basic = require('hapi-auth-basic');

const server = new Hapi.Server();
server.connection({port: 3006});

const users= {
    john: {
        username: 'zhang',
        password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm',
        name: 'zhang',
        id: '123456'
    }
};

const validate = function (request, username, password, callback) {
    const user = user[username];
    
}