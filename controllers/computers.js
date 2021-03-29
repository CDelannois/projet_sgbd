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

    //_____________________________________________________________________Logiciels_____________________________________________________________________________________________

    //Récupération de tous les logiciels
    app.get("/computers/:computerId/softwares", async (req, res) => {
        const { computerId } = req.params;

        const softwares = await computersCollection.aggregate([
            { $match: { _id: new ObjectID(computerId) } },
            { $unwind: '$software' },
            { $project: { software: 1, _id: 0 } },
            {
                $addFields: {
                    name: '$software.name',
                    description: '$software.description',
                    _id: '$software._id',
                }
            },
            { $project: { name: 1, description: 1 } },
        ]).toArray();

        res.json(softwares);
    });

    //Ajouter un logiciel
    app.post('/computers/:computerId/softwares', async (req, res) => {
        const { computerId } = req.params;
        const { name, description } = req.body;
        const _id = new ObjectID(computerId);

        const { value } = await computersCollection.findOneAndUpdate({
            _id
        }, {
            $push: { software: { name, description, _id: new ObjectID() } }
        }, {
            returnOriginal: false,
        })
        res.json({ value });
    });

    //Modifier un logiciel
    app.post('/computers/:computerId/softwares/:softwareId', async (req, res) => {
        const { computerId, softwareId } = req.params;
        const { name, description } = req.body;
        const _id = new ObjectID(computerId);
        const _softwareId = new ObjectID(softwareId);

        const { value } = await computersCollection.findOneAndUpdate({
            _id,
            'software._id': _softwareId
        }, {
            $set: {
                'software.$.name': name,
                'software.$.description': description,
            }
        }, {
            returnOriginal: false,
        });
        res.json({ value });
    });

    //Supprimer un logiciel
    app.delete('/computers/:computerId/softwares/:softwareId', async (req, res) => {
        const { computerId, softwareId } = req.params;
        const _id = new ObjectID(computerId);
        const _softwareId = new ObjectID(softwareId);

        const { value } = await computersCollection.findOneAndUpdate({
            _id
        }, {
            $pull: {
                software:
                {
                    _id: _softwareId
                }
            }
        }, {
            returnOriginal: false,
        })
        res.json({ value });
    });

    //_____________________________________________________________________Interventions________________________________________________________________________________________

    //Récupération de toutes les interventions
    app.get("/computers/:computerId/interventions", async (req, res) => {
        const { computerId } = req.params;

        const interventions = await computersCollection.aggregate([
            { $match: { _id: new ObjectID(computerId) } },
            { $unwind: '$intervention' },
            { $project: { intervention: 1, _id: 0 } },
            {
                $addFields: {
                    date_intervention: '$intervention.date_intervention',
                    object: '$intervention.object',
                    _id: '$intervention._id',
                }
            },
            { $project: { date_intervention: 1, object: 1 } },
        ]).toArray();

        res.json(interventions);
    });

    //Ajouter une intervention
    app.post('/computers/:computerId/interventions', async (req, res) => {
        const { computerId } = req.params;
        const { date, object } = req.body;
        const date_intervention = new Date(date);
        const _id = new ObjectID(computerId);

        const { value } = await computersCollection.findOneAndUpdate({
            _id
        }, {
            $push: { intervention: { date_intervention, object, _id: new ObjectID() } }
        }, {
            returnOriginal: false,
        })
        res.json({ value });
    });

    //Modifier une intervention
    app.post('/computers/:computerId/interventions/:interventionId', async (req, res) => {
        const { computerId, interventionId } = req.params;
        const { date, object } = req.body;
        const date_intervention = new Date(date)
        const _id = new ObjectID(computerId);
        const _interventionId = new ObjectID(interventionId);

        const { value } = await computersCollection.findOneAndUpdate({
            _id,
            'intervention._id': _interventionId
        }, {
            $set: {
                'intervention.$.date_intervention': date_intervention,
                'intervention.$.object': object,
            }
        }, {
            returnOriginal: false,
        });
        res.json({ value });
    });

    //Supprimer une intervention
    app.delete('/computers/:computerId/interventions/:interventionId', async (req, res) => {
        const { computerId, interventionId } = req.params;
        const _id = new ObjectID(computerId);
        const _interventionId = new ObjectID(interventionId);

        const { value } = await computersCollection.findOneAndUpdate({
            _id
        }, {
            $pull: {
                intervention:
                {
                    _id: _interventionId
                }
            }
        }, {
            returnOriginal: false,
        })
        res.json({ value });
    });
}