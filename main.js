var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

//refactoring
var template = {
  // template object에 있는 html는 property다.
  html:function (title, list, body, control){
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
        ${control}
        ${body}
    </body>
    </html>
    `;
  },

  list:function(fileList){
    var list = `<ul>`
    var i = 0;
    while(i<fileList.length){
      list = list + `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`;
      i=i+1;
    }
    list = list+`</ul>`;
    return list;
  }
  
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
/*
          var list = templateList(fileList);
          var template = templateHTML(title, list, `<h2>${title}</h2><p>${description}</p>`, 
          `<a href="/create">Create</a>`);
            response.writeHead(200);
            response.end(template);
*/
          var list = template.list(fileList);
          var html = template.html(title, list, `<h2>${title}</h2><p>${description}</p>`, 
          `<a href="/create">Create</a>`);
            response.writeHead(200);
            response.end(html);    
        });
      }
      else{
          fs.readdir('./data',function(error, fileList){
            //console.log(fileList);

            fs.readFile(`data/${queryData.id}`,'utf-8',function(err,description){
              var title = queryData.id;             
              var list = template.list(fileList);
              var html = template.html(title, list, 
              `<h2>${title}</h2><p>${description}</p>`,
              `<a href="/create">Create</a>
               <a href="/update?id=${title}">Update</a>
               <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <input type="submit" value="delete">
               </form>`);
              response.writeHead(200);
              response.end(html);
          });
        });
      }
    }else if(pathname === '/create'){
      fs.readdir('./data',function(error, fileList){
        //console.log(fileList);
        var title = 'WEB - Create';
        var list = template.list(fileList);
        var html = template.html(title, list, 
        `
        <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
        </form>
        `,'');
          response.writeHead(200);
          response.end(html);
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
        fs.writeFile(`data/${title}`, description, 'utf-8', function(err){
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end('Success');
        });
      }); 
    }
    else if(pathname === '/update'){
      fs.readdir('./data',function(error, fileList){
        fs.readFile(`data/${queryData.id}`,'utf-8',function(err,description){
          var title = queryData.id;             
          var list = template.list(fileList);
          var html = template.html(title, list, 
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
          `<a href="/create">Create</a><a href="/update?id=${title}">Update</a>`);
          response.writeHead(200);
          response.end(html);
      });
    });
    }
    else if(pathname === '/update_process'){
      var body = '';

      request.on('data', function(data){
        body = body + data
      }); 
      request.on('end',function(){
        var post = qs.parse(body);
        var id = post.id
        var title = post.title
        var description = post.description
        console.log(post)
        fs.rename(`data/${id}`, `data/${title}`, function(error){
          fs.writeFile(`data/${title}`, description, 'utf-8', function(err){
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end('Success');
          });
        });
      }); 
    }
    else if(pathname === '/delete_process'){
      var body = '';

      request.on('data', function(data){
        body = body + data
      }); 
      request.on('end',function(){
        var post = qs.parse(body);
        var id = post.id
        fs.unlink(`data/${id}`, function(error){
          response.writeHead(302, {Location: `/`});
          response.end('Success');
        });
      });
    }
    else{
      response.writeHead(404);
      response.end('Not found');
    }
  });
 
    //port번호를 입력(Why HOST(domain)에 여러 포트가 있을 수 있어서) + 기본값 80
    //http(protocol)://opentutorials.org(host or domain):3000(port)/main(path)?id=HTML&page=12(query String)

app.listen(3000);