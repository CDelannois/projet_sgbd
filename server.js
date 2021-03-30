const express = require('express');
const bodyparser = require("body-parser");
const app = express();
const port = 3000;
const databaseConnexion = require("./database/connexion");

app.use(bodyparser.urlencoded({ extended: false }));

//import controllers
const computers = require("./controllers/computers");
const locals = require("./controllers/locals");
const teachers = require("./controllers/teachers");
const classes = require("./controllers/classes");

(async () => {
    const db = await databaseConnexion();

    //call controllers
    computers(app, db);
    locals(app, db);
    teachers(app, db);
    classes(app, db);

    app.get('/', (req, res) => {
        res.send('Hello World!')
    });

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    });
})();