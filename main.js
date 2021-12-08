var http = require('http');
var fs = require('fs');
var app = http.createServer(function(request,response){ 
    var url = request.url;
    if(request.url == '/'){
      url = '/index.html';
    }
    if(request.url == '/favicon.ico'){
        response.writeHead(404);
        response.end();
        return;
    }
    response.writeHead(200);
    //console.log(__dirname + url);
    response.end(fs.readFileSync(__dirname + url));
    //response.end('egoing: '+url)
});
//port번호를 입력(Why HOST(domain)에 여러 포트가 있을 수 있어서) + 기본값 80
//http(protocol)://opentutorials.org(host or domain):3000(port)/main(path)?id=HTML&page=12(query String)
app.listen(3000);