var http = require('http');
var url = require('url');
var topic = require('./lib/topic');
var author = require('./lib/author');
const {auth} = require("mysql/lib/protocol/Auth");

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if(pathname === '/') {
        if (queryData.id === undefined) {           // 메인
            topic.home(request, response);
        } else {            // 상세보기
            topic.page(request, response);
        }
    } else if (pathname === '/create') {            // 생성 화면
        topic.create(request, response);
    } else if (pathname === '/create_process') {    // 생성
        topic.create_process(request, response);
    } else if (pathname === '/update') {            // 수정 화면
        topic.update(request, response);
    } else if(pathname === '/update_process'){      // 수정
        topic.update_process(request, response);
    } else if(pathname === '/delete_process'){      // 삭제
        topic.delete_process(request, response);
    } else if (pathname === '/author') {
        author.home(request, response);
    } else if (pathname === '/author/create_process') {
        author.create_process(request, response);
    } else if (pathname === '/author/update') {
        author.update(request, response);
    } else if (pathname === '/author/update_process') {
        author.update_process(request, response);
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);
