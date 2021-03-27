const { Db, ObjectID } = require('mongodb');

module.exports = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error('Invalid Dabatase');
    }

    const computersCollection = db.collection("computers");

    //Lister les ordinateurs
    app.get('/computers', async (req, res) => {
        const computers = await computersCollection.find().toArray();

        res.json(computers);
    });

    //Lister un ordinateur
    app.get('/computers/:computerId', async (req, res) => {
        try {
            const { computerId } = req.params;
            const _id = new ObjectID(computerId);
            const computer = await computersCollection.findOne({ _id });
            if (computer == null) {
                res.status(404).send({ error: "Impossible to find this computer" });
            }

            res.json(computer);
        }
        catch (err) {
            console.error(`An error occured : ${err}`)
        }
    });

    //Créer un ordinateur
    app.post('/computers', async (req, res) => {
        const data = req.body;
        try {
            data.installation = new Date(data.installation);
            const response = await db.collection("computers").insertOne(data);

            if (response.result.n !== 1 && response.result.ok !== 1) {
                return res.status(400).json({ error: 'impossible to create computer!' });
            }
            //const computer= response.ops[0]; autre possibilité
            const [computer] = response.ops;

            res.json({ computer });
        }
        catch (err) {
            console.error(`An error occured : ${err}`)
            res.json(err)
        }
    });


    //Mettre à jour un ordinateur
    app.post('/computers/:computerId', async (req, res) => {
        const { computerId } = req.params;
        const data = req.body;

        const _id = new ObjectID(computerId);
        const response = await computersCollection.findOneAndUpdate(
            { _id },
            { $set: data },
            { returnOriginal: false }
        );
        if (response.ok !== 1) {
            return res.status(400).json({ error: 'Impossible to update the computer' });
        }

        res.json(response.value);
    });

    //Supprimer un ordinateur
    app.delete('/computers/:computerId', async (req, res) => {
        const { computerId } = req.params;
        const _id = new ObjectID(computerId);

        const response = await computersCollection.findOneAndDelete({ _id });

        if (response.value === null) {
            return res.status(404).send({ error: "This computer doesn't exist." })
        }

        res.status(204).send();
    });
}