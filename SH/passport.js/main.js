var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var flash = require('connect-flash');

app.use(helmet());

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());

app.use(session({
  secret: 'asdfgg',
  resave: false, // true로 할경우 session을 미리 만드는것이도 false로 할경우는 session을 저장할때에 생성되게 한것입니다.
  saveUninitialized: true,
  store: new FileStore()
}));
app.use(flash());   // 내부적으로 세션을 사용하므로 session 코드 아래에 위치해야함. flash미들웨어를 express에 설치
// --- flash 예제 ---
// app.get('/flash', function (req, res) {
//     req.flash('msg', 'Flash is back!');     // 세션스토어에 입력한 데이터를 추가한다.
//     res.send('flash');
// });
//
// app.get('/flash-display', function (req, res) {
//     var fmsg = req.flash(); // 데이터를 사용한 뒤 지운다. 일회성 메세지
//     console.log(fmsg);
//     res.send(fmsg);
// });
// --- /flash 예제 ---

var passport = require('./lib/passport')(app);  // passport 파일에서 함수자체를 export시켰기 때문에 passport륾 require한것 자체가 함수이며, 파라미터로는 app을 넘긴다.
                                // passport파일에서 passport객체를 리턴시키므로 require('./lib/passport')(app) 자체는 passport객체가 된다.

app.get('*', function(request, response, next){
  fs.readdir('./data', function(error, filelist){
    request.list = filelist;
    next();
  });
});

var indexRouter = require('./routes');
var topicRouter = require('./routes/topic');
var authRouter = require('./routes/auth')(passport);  // 함수를 호출하면서 인자로 passport를 주입한다. 함수명옆에 () 이면 함수를 호출하는 것이다.

app.use('/', indexRouter);
app.use('/topic', topicRouter);
app.use('/auth', authRouter);

app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
});
