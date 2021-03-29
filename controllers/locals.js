const { Db, ObjectID } = require('mongodb');

module.exports = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error('Invalid Dabatase');
    }

    const localsCollection = db.collection("locals");

    //Lister les locaux
    app.get('/locals', async (req, res) => {
        const locals = await localsCollection.find().toArray();

        res.json(locals);
    });

    //Lister un local
    app.get('/locals/:localId', async (req, res) => {
        try {
            const { localId } = req.params;
            const _id = new ObjectID(localId);
            const local = await localsCollection.findOne({ _id });
            if (local == null) {
                res.status(404).send({ error: "Impossible to find this local" });
            }

            res.json(local);
        }
        catch (err) {
            console.error(`An error occured : ${err}`)
        }
    });

    //Créer un local
    app.post('/locals', async (req, res) => {
        const data = req.body;
        try {
            const response = await db.collection("locals").insertOne(data);

            if (response.result.n !== 1 && response.result.ok !== 1) {
                return res.status(400).json({ error: 'impossible to create local!' });
            }
            const [local] = response.ops;

            res.json({ local });
        }
        catch (err) {
            console.error(`An error occured : ${err}`)
            res.json(err)
        }
    });


    //Mettre à jour un local
    app.post('/locals/:localId', async (req, res) => {
        const { localId } = req.params;
        const data = req.body;

        const _id = new ObjectID(localId);
        const response = await localsCollection.findOneAndUpdate(
            { _id },
            { $set: data },
            { returnOriginal: false }
        );
        if (response.ok !== 1) {
            return res.status(400).json({ error: 'Impossible to update the local' });
        }

        res.json(response.value);
    });

    //Supprimer un local
    app.delete('/locals/:localId', async (req, res) => {
        const { localId } = req.params;
        const _id = new ObjectID(localId);

        const response = await localsCollection.findOneAndDelete({ _id });

        if (response.value === null) {
            return res.status(404).send({ error: "This local doesn't exist." })
        }

        res.status(204).send();
    });
}