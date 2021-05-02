const MongoClient = require("mongodb").MongoClient;

//Import des contraintes
const classes_constraint = require('./validation/classes_constraint');
const computers_constraint = require('./validation/computers_constraint');
const locals_constraint = require('./validation/locals_constraint');
const teachers_constraint = require('./validation/teachers_constraint');
const login_constraint = require('./validation/login_constraint');

const url = "mongodb://localhost:27017";//Quand l'API sera terminée, remplacer par 27033.

const dbName = "gestion_ordinateurs";

const getDb = async () => {
  let db;
  try {
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    db = client.db(dbName);
    await login_constraint(db);
    await classes_constraint(db);
    await computers_constraint(db);
    await locals_constraint(db);
    await teachers_constraint(db);
  } catch (error) {
    console.error(error);
  }

  return db;
};

module.exports = getDb;