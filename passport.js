const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;


function myPassportLocal(db) {
    const userCollection = db.collection('users');
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'userName',
                passwordField: 'password'
            },
            async (userName, password, cb) => {
                try {
                    const user = await userCollection.findOne({
                        userName,
                    });
                    if (user && bcrypt.compareSync(password, user.password)) {
                        return cb(null, user, { message: 'Logged In Successfully' });
                    }
                } catch (e) {
                    console.log(e);
                }
                return cb(null, false, { message: 'Incorrect user name or password.' });
            }
        ));
}

function myPassportJWT() {
    passport.use(
        new JWTStrategy({
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: "maSignature",
        }, function (jwtPayload, cb) {
            return cb(null, jwtPayload);
        })
    )
}

module.exports = {
    myPassportLocal,
    myPassportJWT,
};