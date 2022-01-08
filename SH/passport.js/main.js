var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

app.use(helmet());

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());

app.use(session({
  secret: 'asdfgg',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}));

// passport 관련
// passport는 세션을 내부적으로 사용하므로 express-session을 활성화시키는 코드 다음에 와야 한다.
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
app.post('/auth/login_process',
    passport.authenticate('local', {  // local: username과 password로 로그인하는것, local이 아닌 그외방식은 facebook, google등으로 로그인 하는것
      successRedirect: '/', // 성공시
      failureRedirect: '/auth/login' // 실패시
    }));


app.get('*', function(request, response, next){
  fs.readdir('./data', function(error, filelist){
    request.list = filelist;
    next();
  });
});

var indexRouter = require('./routes');
var topicRouter = require('./routes/topic');
var authRouter = require('./routes/auth');

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
