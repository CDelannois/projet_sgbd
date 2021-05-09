const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const port = 3000;
const databaseConnexion = require('./database/connexion');
const { myPassportLocal, myPassportJWT } = require('./passport');
const passport = require('passport');

app.use(bodyparser.urlencoded({ extended: false }));

(async () => {
    app.use('^/api', passport.authenticate('jwt', { session: false }));

    const db = await databaseConnexion();

    //passport
    myPassportLocal(db);
    myPassportJWT();

    //import controllers
    const computers = require("./controllers/computers");
    const locals = require("./controllers/locals");
    const teachers = require("./controllers/teachers");
    const classes = require("./controllers/classes");
    const users = require("./controllers/users");

    //call controllers
    computers(app, db);
    locals(app, db);
    teachers(app, db);
    classes(app, db);
    users(app, db);

    app.get('/', (req, res) => {
        res.send('Hello World!')
    });

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    });
})();