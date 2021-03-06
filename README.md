## 中文版 Hapi.js Tutorial


### 安装

这个教程适配于 hapi v11.x.x.

创建一个路径  <em>myproject</em>， 运行下面的命令:

* 运行: __npm init__ 然后根据提示选择, 这样会生成一个 package.json 项目配置文件.
* 运行: __npm install --save hapi__ 安装Hapi, 并将其保存到 package.json ，成为项目的一个依赖.
现在就可以开始写代码来生成一个基础的应用了.

### 创建一个简单的服务器

一个最为基础的服务器应用的代码如下:
```javascript

'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3000, host: 'localhost' });

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
```

首先, 引入依赖. 然后我们创建了一个 hapi server 对象. 然后我们为这个server对象添加一个连接, 传入一个端口给这个连接，使之监听请求. 然后，开启这个server，就可以看到console中的log信息了.

当我们给server添加连接的时候, 我们也可以传入一个 主机名, IP 地址, 或者 Unix socket 文件,  Windows 具名管道来让我们的server去绑定. 具体的用法需要查看API.

### 添加路由

现在我们需要添加一些路由来实现一些简单的逻辑. 下面的代码就是简单的路由:

```javascript

'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3000, host: 'localhost' });

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello, world!');
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
        reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
    }
});

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});

```
将上面的代码保存为 server.js 然后使用 __node server.js__ 来开启这个server. 现在你可以访问 http://localhost:3000/stimpy 然后可以发现 Hello, stimpy!.

注意，在这里我们 URI 编码了用户传递过来的参数, 这是为了防止注入攻击. 任何时候都不要信任用户传递过来的任何字符串，不要运行他们，记住要先格式化!

关于method这个参数，可以是任何合理的HTTP请求方式，也可以是一个数组，也可以用*来表示任意的方式. path这个属性定义了匹配参数的规则. 规定的参数可以包括字符串，数字以及通配符. 需要更多这方面的消息，可以查看文档的路由那一章节.

### 提供静态网页服务

现在我们已经可以实现一个简单的Heelo World服务器了，但是这还不够. 接下来, 我们将要使用inert来进行一个静态的网页服务搭建. 在这之前，使用 CTRL + C 来关闭我们的服务器，**这里可以参见我的另一片博客，使用nodemon，webpack-dev-server以及pm2来实现热重启**.

首先还是安装这个插件: **npm install --save inert ** 这个命令会下载 inert 并且将其添加到 package.json, 成为一个配置中的依赖.

将下面这段代码添加到 server.js:

```javascript

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

```
上面的 server.register() 将 inert 插件添加到了 Hapi 应用中. 在这方法中还传入了一个匿名函数，这是为了处理当我们的插件没能正确的加载到应用中的情况，这时候我们会抛出这个错误。每当我们需要向应用中添加插件的时候，我们就需要传入回调函数来处理异常，__至于为什么要采用这种方式而不是和Java一样采用try-catch的方式，这是因为，jacvascript本身就是异步的.__

 server.route() 注册了 /hello 这个路由, 当我们的应用接收到了GET方式请求的 /hello 路由时就会返回 hello.html 这个文件. 我们把路由的回调响应函数放在注册inert插件的函数块内部， 这是为了确保在我们的路由响应函数作出响应之前，我们的插件inert确保呗注册到了整个应用之中. 这种方式在像这样的经常需要插件来辅助的应用中时非常明智的，可以规避许多依赖相关的问题.

使用  __npm start__ 开启应用并且在浏览器中访问访问 http://localhost:3000/hello . 出错了，我们发现 404 错误出现在浏览器中，因为现在为止我们还根本没有创建 hello.html 这个文件啊. 现在我们创建这个文件来解决这个错误.

创建public文件夹 并且创建hello.html，注意路径之间的相对关系. 在hello.html写上以下的简单内容: 
```html
<h2>Hello World.</h2>
```

在浏览器中刷新这个页面. 现在应该能看到 "Hello World."出现在页面之中了。

当一个请求发送到inert之后，inert会返回这个请求所指向的文件, 这也就是的静态服务实际上变的可以热重启，因为inert不会缓存文件，他总是返回最新的文件. 现在你可以在 /hello 这个路由中试着改改你的文件来体验一下.

更多关于静态文件服务的信息在文档的先关章节.这个技术用于在你的应用中为图片，静态文件以及静态页面提供支持.

## 使用插件

在我们开发一个web应用的时候，一个基本的需求就是能够有一个可以轻松获取到的日志信息系统. 为了在我们的应用中添加一些基本的日志功能, 我们现在在应用中添加一个good-console插件来实现这个需求. 我们同时也需要一些过滤机制. 我们使用 good-squeeze 插件来实现这个功能.

首先还是安装这些插件以及他们的依赖:
```shell
npm install --save good
npm install --save good-console
npm install --save good-squeeze
```
根据下面的代码来更新一下你的server.js:
```javascript
'use strict';

const Hapi = require('hapi');
const Good = require('good');

const server = new Hapi.Server();
server.connection({ port: 3000, host: 'localhost' });

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello, world!');
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
        reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
    }
});

server.register({
    register: Good,
    options: {
        reporters: {
            console: [{
                module: 'good-squeeze',
                name: 'Squeeze',
                args: [{
                    response: '*',
                    log: '*'
                }]
            }, {
                module: 'good-console'
            }, 'stdout']
        }
    }
}, (err) => {

    if (err) {
        throw err; // something bad happened loading the plugin
    }

    server.start((err) => {

        if (err) {
            throw err;
        }
        server.log('info', 'Server running at: ' + server.info.uri);
    });
});
```
重新启动这个应用，你会发现:
```shell
140625/143008.751, [log,info], data: Server running at: http://localhost:3000
```
如果你访问 http://localhost:3000/  ,你会看见:
```shell
140625/143205.774, [response], http://localhost:3000: get / {} 200 (10ms)
```
很好，以上是一个非常简短的使用第三方插件的例子，更多的信息在文档的相关部分.

## 关于其他

这个框架很不错，恩，有问题就去github或者freenode上提issue就好 #hapi.