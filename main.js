var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

function templateHTML(title, list, body){
  return `
  <!doctype html>
  <html>
  <head>
    <title>WEB - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
      ${list}
      <a href="/create">Create</a>
      ${body}
  </body>
  </html>
  `;
}
 
function templateList(fileList){
  var list = `<ul>`
  var i = 0;
  while(i<fileList.length){
    list = list + `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`;
    i=i+1;
  }
  list = list+`</ul>`;
  return list;
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    // path와 pathname 차이
    //console.log(pathname);

    if(pathname === '/'){
      if(queryData.id === undefined){

        fs.readdir('./data',function(error, fileList){
          //console.log(fileList);
          var description = 'Hi How are you doin?';
          var title = 'Welcome';
          var list = templateList(fileList);
          var template = templateHTML(title, list, `<h2>${title}</h2><p>${description}</p>`);
            response.writeHead(200);
            response.end(template);
        });
      }
      else{
          fs.readdir('./data',function(error, fileList){
            //console.log(fileList);

            fs.readFile(`data/${queryData.id}`,'utf-8',function(err,description){
              var title = queryData.id;             
              var list = templateList(fileList);
              var template = templateHTML(title, list, `<h2>${title}</h2><p>${description}</p>`);
              response.writeHead(200);
              response.end(template);
          });
        });
      }
    }else if(pathname === '/create'){
      fs.readdir('./data',function(error, fileList){
        //console.log(fileList);
        var title = 'WEB - Create';
        var list = templateList(fileList);
        var template = templateHTML(title, list, `
        <form action="http://localhost:3000/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
        </form>
        `);
          response.writeHead(200);
          response.end(template);
      });
    }
    else if(pathname === '/create_process'){
      var body = '';

      request.on('data', function(data){
        body = body + data
      }); 
      request.on('end',function(){
        var post = qs.parse(body);
        var title = post.title
        var description = post.description
        //console.log(post.title)
      }); 
      response.writeHead(200);
      response.end('Success');
    }
    else{
      response.writeHead(404);
      response.end('Not found');
    }
  });
 
    //port번호를 입력(Why HOST(domain)에 여러 포트가 있을 수 있어서) + 기본값 80
    //http(protocol)://opentutorials.org(host or domain):3000(port)/main(path)?id=HTML&page=12(query String)

app.listen(3000);