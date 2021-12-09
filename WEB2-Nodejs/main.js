var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathName = url.parse(_url, true).pathname;

    if (pathName === '/') {
        if (queryData.id === undefined) {

            fs.readdir('./data', function (error, filelist) {
                var title = 'Welcome';
                var description = 'Hello, Node.js';
                var list = template.list(filelist);
                var html = template.HTML(title, list, `
                    <h2>${title}</h2>${description}
                    <a href="/create">create</a>
                `);

                response.writeHead(200);
                response.end(html);
            });

        } else {
            fs.readdir('./data', function (error, filelist) {
                fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
                    var title = queryData.id;
                    var list = template.list(filelist);
                    var html = template.HTML(title, list,
                        `<h2>${title}</h2>${description}`,
                        `<a href="/create">create</a> 
                               <a href="/update?id=${title}">update</a>
                               <form action="delete_process" method="post">
                                  <input type="hidden" name="id" value="${title}"> 
                                  <input type="submit" value="delete"> 
                               </form>
                    `);

                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if (pathName === '/create') {
        fs.readdir('./data', function (error, filelist) {
            var title = 'WEB - create';
            var list = template.list(filelist);
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

            response.writeHead(200);
            response.end(html);
        });
    } else if (pathName === '/create_process') {
        var body = '';

        request.on('data', function (data) {  // 데이터가 클 수 있으므로 조각조각 나눠서 전달.
            body = body + data;
        });
        request.on('end', function () {  // 데이터가 너무 크면 꺼버리거나, 데이터를 다 전달하면 이 콜백함수 호출
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;

            fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
                response.writeHead(302, {location: `/?id=${title}`});
                response.end('success');
            });
        });

    } else if (pathName === '/update') {
        fs.readdir('./data', function (error, filelist) {
            fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
                var title = queryData.id;
                var list = template.list(filelist);
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

                response.writeHead(200);
                response.end(html);
            });
        });
    } else if (pathName === '/update_process') {
        var body = '';

        request.on('data', function (data) {  // 데이터가 클 수 있으므로 조각조각 나눠서 전달.
            body = body + data;
        });
        request.on('end', function () {  // 데이터가 너무 크면 꺼버리거나, 데이터를 다 전달하면 이 콜백함수 호출
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;

            fs.rename(`data/${id}`, `data/${title}`, function (error) {
                fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
                    response.writeHead(302, {location: `/?id=${title}`});
                    response.end();
                });
            });
        });
    } else if (pathName === '/delete_process') {
        var body = '';

        request.on('data', function (data) {  // 데이터가 클 수 있으므로 조각조각 나눠서 전달.
            body = body + data;
        });
        request.on('end', function () {  // 데이터가 너무 크면 꺼버리거나, 데이터를 다 전달하면 이 콜백함수 호출
            var post = qs.parse(body);
            var id = post.id;

            fs.unlink(`data/${id}`, function (error) {
                response.writeHead(302, {location: `/`});
                response.end();
            });
        });
    } else {
        response.writeHead(404);
        response.end('Not Found');
    }

});
app.listen(3000);