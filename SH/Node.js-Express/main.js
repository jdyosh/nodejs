const express = require('express');
const app = express();
var fs = require('fs');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var qs = require('querystring');
var bodyParser = require('body-parser');
var compression = require('compression');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
// main.js가 실행되면서 app.use안에 해당 bodyParser 미들웨어가 들어오게 된다. 또한 실행된다.
// 사용자가 전송한 post 데이터를 내부적으로 분석해서 request에 body 프로퍼티를 만든다. => request.body를 사용 가능하다.
app.use(compression());
// 미들웨어는 요청이 들어올 때 마다 실행된다. 요청이 들어올 때 마다 bodyParser가 실행되고 다음 compression이 실행된다.

app.get('*', function (request, response, next) {  // 이 파라미터는 약속된것임.
    fs.readdir('./data', function (error, filelist) {
        request.list = filelist;  // request객체에 list라는 변수를 만들어서 filelist값을 담는다.
        next();  // 그다음에 호출되어야 할 미들웨어가 담겨있다.
    });
});
// 미들웨어가 필요 없는 요청들은 낭비이기 때문에 app.use를 app.get('*' 으로 바꿔서 get방식으로 들어오는 요청에만 적용할 수 있게 변경
// => 모양이 만들어놨던 라우트코드와 같다. 따라서 라우트코드의 콜백함수는 미들웨어라고 할 수 있다.

app.get('/', function (request, response) {
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(request.list);
    var html = template.HTML(title, list,
        `<h2>${title}</h2>${description}
                <img src="/images/hello.jpg" style="width: 300px; display:block; margin-top:10px;">`,
        `<a href="/create">create</a>`
    );
    response.send(html);
});

app.get('/page/:pageId', function (request, response, next) {
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
        if (err) {
            next(err);
        } else {
            var title = request.params.pageId;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
                allowedTags:['h1']
            });
            var list = template.list(request.list);
            var html = template.HTML(sanitizedTitle, list,
                `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                ` <a href="/create">create</a>
                <a href="/update/${sanitizedTitle}">update</a>
                <form action="/delete_process" method="post">
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
                </form>`
            );
            response.send(html);
        }
    });
});

app.get('/create', function (request, response) {
    var title = 'WEB - create';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `, '');
    response.send(html);
});

app.post('/create_process', function (request, response) {
    var post = request.body;
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function(err){
        response.writeHead(302, {Location: `/page/${title}`});
        response.end();
    })
});

app.get('/update/:pageId', function (request, response) {
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
        var title = request.params.pageId;
        var list = template.list(request.list);
        var html = template.HTML(title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
        );
        response.send(html);
    });
});

app.post('/update_process', function (request, response) {
    var post = request.body;
    var id = post.id;
    var title = post.title;
    var description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function(error){
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.redirect(`/page/${title}`);
        })
    });
});

app.post('/delete_process', function (request, response) {
    var post = request.body;
    var id = post.id;
    var filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function(error){
        response.redirect('/')
    })
});

app.use(function (request, response, next) {
    response.status(404).send('Sorry cant find that!');
});

app.use(function (err, request, response, next) {
    console.error(err.stack);
    response.status(500).send('Something broke!');
});

app.listen(3000, function () {
    console.log(`Example app listening on port http://localhost:3000!`);
})

