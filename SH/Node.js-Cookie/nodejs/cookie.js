var http = require('http');
var cookie = require('cookie');
http.createServer(function (request, response) {

    // 쿠키 읽기
   var cookies = {};

    if (request.headers.cookie !== undefined) {
        cookies = cookie.parse(request.headers.cookie);
    }
    console.log(cookies.yummy_cookie);

    // 쿠키 생성
    response.writeHead(200, {
        'Set-Cookie': [
            'yummy_cookie=choco',
            'tasty_cookie=strawberry',
            `Permanent=cookies; Max-Age=${60*60*24*30}`,
            'Securetest=Securetest; Secure',
            'HttpOnlytest=HttpOnlytest; HttpOnly',
            'Pathtest=Pathtest; Path=/cookie',
            'Domaintest=Domaintest; Domain=o2.org'
        ]
    });
    response.end('Cookie!!');
}).listen(3000);