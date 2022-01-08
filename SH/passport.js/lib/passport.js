module.exports = function (app) {

    var authData = {
        email: 'egoing@gmail.com',
        password: '1111',
        nickname: 'egoing'
    };

    // passport는 세션을 내부적으로 사용하므로 express-session을 활성화시키는 코드 다음에 와야 한다.
    var passport = require('passport')
        , LocalStrategy = require('passport-local').Strategy;

    app.use(passport.initialize());  // passport 미들웨어를 express에 설치
    app.use(passport.session());    // 내부적으로 passport는 세션 위에서 동작하므로

    passport.serializeUser(function(user, done) {   // 로그인에 성공했을 때 딱 한번 호출한다.
        // 세션 데이터 안에 passport user 값으로 사용자의 식별자가 저장된다.
        done(null, user.email);  // 두번째인자는 구분되는 식별자.
    });

    passport.deserializeUser(function (id, done) { // 페이지를 방문할 때 마다 호출된다. 로그인한 사용자인지 아닌지 체크할때 사용한다.
        done(null, authData);
    });

    passport.use(new LocalStrategy(
        {   // form 에서 아이디 비밀번호를 넘겨줄때 username, password 라는 name으로 넘겨야 하는데 다른이름으로 넘기고 싶을때
            usernameField: 'email',
            passwordField: 'pwd'
        },
        function (username, password, done) {   // done이라는 함수를 어떻게 호출하냐에 따라 성공실패를 알려준다
            if (username === authData.email) {
                if (password === authData.password) {
                    return done(null, authData);    // 바로 다음에 passport.serializeUser를 호출한다.
                } else {
                    return done(null, false, {
                        message: 'Incorrect password.'
                    });
                }
            } else {
                return done(null, false, {
                    message: 'Incorrect username.'
                });
            }
        }
    ));
    return passport;
}

