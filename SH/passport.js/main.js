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

var authData = {
    email: 'egoing@gmail.com',
    password: '1111',
    nickname: 'egoing'
};

// passport 관련
// passport는 세션을 내부적으로 사용하므로 express-session을 활성화시키는 코드 다음에 와야 한다.
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    {   // form 에서 아이디 비밀번호를 넘겨줄때 username, password 라는 name으로 넘겨야 하는데 다른이름으로 넘기고 싶을때
        usernameField: 'email',
        passwordField: 'pwd'
    },
    function (username, password, done) {   // done이라는 함수를 어떻게 호출하냐에 따라 성공실패를 알려준다
        console.log('LocalStrategy', username, password);
        if (username === authData.email) {
            console.log(1);
            if (password === authData.password) {
                console.log(2);
                return done(null, authData);
            } else {
                console.log(3);
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
        } else {
            console.log(4);
            return done(null, false, {
                message: 'Incorrect username.'
            });
        }
    }
));

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
