var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');
var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');
var helmet = require('helmet');
app.use(helmet());

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

app.use('/', indexRouter);
app.use('/topic', topicRouter);

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

