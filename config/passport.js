const db = require('./database');
const User = require('../models/user');
const secret_key = require('../config/secret_key');

const passportJWT = require('passport-jwt');

let JwtStrategy = passportJWT.Strategy;
let ExtractJwt = passportJWT.ExtractJwt;

module.exports = passport => {
    let jwtOptions = {}
    jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    jwtOptions.secretOrKey = secret_key;

    let strategy = new JwtStrategy(jwtOptions, function(jwt_payload, done) {
        console.log('payload received', jwt_payload);
        User
          .findOne({where: { id: jwt_payload.sub}})
          .then((user) => {
            done(null, user, {message: 'Good'});
          })
          .catch((err) => {
            done(null, false, {message: 'Good'});
          });
    })
    passport.use(strategy);
}

