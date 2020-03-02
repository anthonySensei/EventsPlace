const bCrypt = require('bcryptjs');

const passportJWT = require('passport-jwt');

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const status = require('../enums/user-status.enum');

module.exports = (passport, user) => {
  let User = user;
  
  const LocalStrategy = require('passport-local').Strategy;
  
    passport.use(new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true 
        },
        (req, email, password, done) => {

            let User = user;
            const isValidPassword = (userPass, password) => {
                return bCrypt.compareSync(password, userPass);
            }

            User.findOne({
                where: {
                    email: email,
                    status: status.ACTIVATED
                }
            }).then(user  => {
                if (!user) {
                    return done(null, false, {
                        message: 'Email does not exist'
                    });

                }
                if (!isValidPassword(user.password, password)) {
                    return done(null, false, {
                        message: 'Incorrect password.'
                    });
                }
                let userInfo = user.get();
                return done(null, userInfo);

            }).catch(err => {
                return done(null, false, {
                    message: 'Something went wrong with your Sign in'
                });
            });
        }
    ));

    passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey   : secret_key
    },
    function (jwtPayload, cb) {

        return User.findOne({where: {id: jwtPayload.id}})
            .then(user => {
                return cb(null, user);
            })
            .catch(err => {
                return cb(err);
            });
    }
    ));

    passport.serializeUser(function (auth, done) {
        done(null, auth.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findOne({where: {id: id}}).then(function (user) {
            if (user) {
                done(null, user.get());
            } else {
                done(user.errors, null);
            }
        });
    });
}