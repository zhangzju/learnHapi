## 认证

这个教程适用于 hapi v11.x.x.

hapi内置的认证系统是基于 schemes 和 strategies的.

scheme就是认证中的一种通用的结构或者抽象, 就像是 "basic"（基础结构） 或者 "digest"（抽象结构）. 
strategy是从另一个方面来考虑的, 一种提前配置好的，具名的scheme.

首先，查看下面这个例子来了解如何使用hapi-auth-basic:
```javascript
'use strict';

const Bcrypt = require('bcrypt');
const Hapi = require('hapi');
const Basic = require('hapi-auth-basic');

const server = new Hapi.Server();
server.connection({ port: 3000 });

const users = {
    john: {
        username: 'john',
        password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm',   // 'secret'
        name: 'John Doe',
        id: '2133d32a'
    }
};

const validate = function (request, username, password, callback) {
    const user = users[username];
    if (!user) {
        return callback(null, false);
    }

    Bcrypt.compare(password, user.password, (err, isValid) => {
        callback(err, isValid, { id: user.id, name: user.name });
    });
};

server.register(Basic, (err) => {

    if (err) {
        throw err;
    }

    server.auth.strategy('simple', 'basic', { validateFunc: validate });
    server.route({
        method: 'GET',
        path: '/',
        config: {
            auth: 'simple',
            handler: function (request, reply) {
                reply('hello, ' + request.auth.credentials.name);
            }
        }
    });

    server.start((err) => {

        if (err) {
            throw err;
        }

        console.log('server running at: ' + server.info.uri);
    });
});
```
首先, 我们定义一个用户数据, 在这里是一个简单的对象. 然后我们定义一个验证函数, 即 __validate__ , 这个函数配置了 hapi-auth-basic 同时允许我们去验证用户是否具有合法的凭据.

然后, 把插件注册到应用中,插件中有一个名为 basic的scheme. 这个scheme是在 server.auth.scheme()中定义的.

当插件被注册到应用中的时候, 我们使用 server.auth.strategy()来创建一个名为 simple 的strategy，这个strategy对应了前面提到的内置的 basic的schme. 我们把配置作为一个对象传入给 scheme 并且允许插件来控制应用的行为.

最后我们在路由中告诉需要经过auth的路由，我们使用 simple 这个strategy来对这个路由进行 authentication.

## Schemes

scheme 是一种类似 **function (server, options)**的方法 ，他需要包含两个参数 __server, options__. server 参数是scheme所添加到的应用, options是使用这个scheme注册一个strategy时的配置。 

这个方法(scheme)至少需要能够返回一个对象，这个对象必须包含 __authenticate__ 这个属性. 此外还可以有 __payload__ 和 __response__.

## authenticate

authenticate 是形如 **function (request, reply)** 的方法, 在scheme中是唯一必须包含的方法.

在请求上下文中, request 是应用生成的request对象. 和route的handler方法中的request对象一致, 可以在文档中查看具体的属性.

reply 是标准的hapi响应接口, 他按照顺序接受err和result parameters.

如果err 不为null, 这意味着在authentication的过程中出现了错误， 这个错误会被当做正常的reply传递给最后的用户. 合理的做法应当是使用一个boom对象来控制错误处理，同时也能够更加方便的向用户提供合适的返回码.

result parameter应当是一个对象, 不过如果err不为null的话，这个对象以及他的属性都是可选的.

If you would like to provide more detail in the case of a failure, the result object must have a credentials property which is an object representing the authenticated user (or the credentials the user attempted to authenticate with) and should be called like reply(error, null, result);.

When authentication is successful, you must call reply.continue(result) where result is an object with a credentials property.

Additionally, you may also have an artifacts key, which can contain any authentication related data that is not part of the user's credentials.

The credentials and artifacts properties can be accessed later (in a route handler, for example) as part of the request.auth object.

payload

The payload method has the signature function (request, reply).

Again, the standard hapi reply interface is available here. To signal a failure call reply(error, result) or simply reply(error) (again, recommended to use boom) for errors.

To signal a successful authentication, call reply.continue() with no parameters.

response

The response method also has the signature function (request, reply) and utilizes the standard reply interface.

This method is intended to decorate the response object (request.response) with additional headers, before the response is sent to the user.

Once any decoration is complete, you must call reply.continue(), and the response will be sent.

If an error occurs, you should instead call reply(error) where error is recommended to be a boom.

Registration

To register a scheme, use either server.auth.scheme(name, scheme). The name parameter is a string used to identify this specific scheme, the scheme parameter is a method as described above.

Strategies

Once you've registered your scheme, you need a way to use it. This is where strategies come in.

As mentioned above, a strategy is essentially a pre-configured copy of a scheme.

To register a strategy, we must first have a scheme registered. Once that's complete, use server.auth.strategy(name, scheme, [mode], [options]) to register your strategy.

The name parameter must be a string, and will be used later to identify this specific strategy. scheme is also a string, and is the name of the scheme this strategy is to be an instance of.

Mode

mode is the first optional parameter, and may be either true, false, 'required', 'optional', or 'try'.

The default mode is false, which means that the strategy will be registered but not applied anywhere until you do so manually.

If set to true or 'required', which are the same, the strategy will be automatically assigned to all routes that don't contain an auth config. This setting means that in order to access the route, the user must be authenticated, and their authentication must be valid, otherwise they will receive an error.

If mode is set to 'optional' the strategy will still be applied to all routes lacking auth config, but in this case the user does not need to be authenticated. Authentication data is optional, but must be valid if provided.

The last mode setting is 'try' which, again, applies to all routes lacking an auth config. The difference between 'try' and 'optional' is that with 'try' invalid authentication is accepted, and the user will still reach the route handler.

Options

The final optional parameter is options, which will be passed directly to the named scheme.

Setting a default strategy

As previously mentioned, the mode parameter can be used with server.auth.strategy() to set a default strategy. You may also set a default strategy explicitly by using server.auth.default().

This method accepts one parameter, which may be either a string with the name of the strategy to be used as default, or an object in the same format as the route handler's auth options.

Note that any routes added before server.auth.default() is called will not have the default applied to them. If you need to make sure that all routes have the default strategy applied, you must either call server.auth.default() before adding any of your routes, or set the default mode when registering the strategy.

Route configuration

Authentication can also be configured on a route, by the config.auth parameter. If set to false, authentication is disabled for the route.

It may also be set to a string with the name of the strategy to use, or an object with mode, strategies, and payload parameters.

The mode parameter may be set to 'required', 'optional', or 'try' and works the same as when registering a strategy.

When specifying one strategy, you may set the strategy property to a string with the name of the strategy. When specifying more than one strategy, the parameter name must be strategies and should be an array of strings each naming a strategy to try. The strategies will then be attempted in order until one succeeds, or they have all failed.

Lastly, the payload parameter can be set to false denoting the payload is not to be authenticated, 'required' or true meaning that it must be authenticated, or 'optional' meaning that if the client includes payload authentication information, the authentication must be valid.

The payload parameter is only possible to use with a strategy that supports the payload method in its scheme.