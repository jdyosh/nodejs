var http = require('http');
var fs = require('fs');
var url = require('url');
 
var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var title = queryData.id;
    if(_url == '/'){
      title = 'Welcome';
    }
    if(_url == '/favicon.ico'){
      return response.writeHead(404);
    }
    response.writeHead(200);
    fs.readFile(`data/${queryData.id}`,'utf-8',function(err,description){
      console.log(description)
        var template = `
        <!doctype html>
        <html>
        <head>
          <title>WEB1 - ${title}</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1><a href="/">WEB</a></h1>
          <ul>
            <li><a href="/?id=HTML">HTML</a></li>
            <li><a href="/?id=CSS">CSS</a></li>
            <li><a href="/?id=JavaScript">JavaScript</a></li>
          </ul>
          <h2>${title}</h2>
          <p>
          ${description}
          </p>
        </body>
        </html>
        `;
      
        response.end(template);
    });
 
    //port번호를 입력(Why HOST(domain)에 여러 포트가 있을 수 있어서) + 기본값 80
    //http(protocol)://opentutorials.org(host or domain):3000(port)/main(path)?id=HTML&page=12(query String)

 
});
app.listen(3000);