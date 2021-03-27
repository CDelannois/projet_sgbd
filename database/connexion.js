const MongoClient = require("mongodb").MongoClient;

//Import des contraintes

const url = "mongodb://localhost:27017";

const dbName = "gestion_ordinateurs";

const getDb = async () => {
  let db;
  try {
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    db = client.db(dbName);
    /*AJOUTER LES CONTRAINTES ICI
    await Constraint(db);*/
  } catch (error) {
    console.error(error);
  }

  return db;
};

module.exports = getDb;