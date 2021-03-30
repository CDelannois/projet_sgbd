const { Db, ObjectID } = require('mongodb');

module.exports = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error('Invalid Dabatase');
    }

    const classesCollection = db.collection("classes");

    //Lister les classes
    app.get('/classes', async (req, res) => {
        const classes = await classesCollection.find().toArray();

        res.json(classes);
    });

    //Lister une classe
    app.get('/classes/:classeId', async (req, res) => {
        try {
            const { classeId } = req.params;
            const _id = new ObjectID(classeId);
            const classe = await classesCollection.findOne({ _id });
            if (classe == null) {
                res.status(404).send({ error: "Impossible to find this classe" });
            }

            res.json(classe);
        }
        catch (err) {
            console.error(`An error occured : ${err}`)
        }
    });

    //Créer une classe
    app.post('/classes', async (req, res) => {
        const data = req.body;
        try {
            const response = await db.collection("classes").insertOne(data);

            if (response.result.n !== 1 && response.result.ok !== 1) {
                return res.status(400).json({ error: 'impossible to create class!' });
            }
            const [classe] = response.ops;

            res.json({ classe });
        }
        catch (err) {
            console.error(`An error occured : ${err}`)
            res.json(err)
        }
    });


    //Mettre à jour une classe
    app.post('/classes/:classeId', async (req, res) => {
        const { classeId } = req.params;
        const data = req.body;

        const _id = new ObjectID(classeId);
        const response = await classesCollection.findOneAndUpdate(
            { _id },
            { $set: data },
            { returnOriginal: false }
        );
        if (response.ok !== 1) {
            return res.status(400).json({ error: 'Impossible to update the class' });
        }

        res.json(response.value);
    });

    //Supprimer une classe
    app.delete('/classes/:classeId', async (req, res) => {
        const { classeId } = req.params;
        const _id = new ObjectID(classeId);

        const response = await classesCollection.findOneAndDelete({ _id });

        if (response.value === null) {
            return res.status(404).send({ error: "This class doesn't exist." })
        }

        res.status(204).send();
    });

    //_____________________________________________________________________Elèves_____________________________________________________________________________________________

    //Récupération de tous les élèves
    app.get("/classes/:classeId/students", async (req, res) => {
        const { classeId } = req.params;

        const students = await classesCollection.aggregate([
            { $match: { _id: new ObjectID(classeId) } },
            { $unwind: '$student' },
            { $project: { student: 1, _id: 0 } },
            {
                $addFields: {
                    last_name: '$student.last_name',
                    first_name: '$student.first_name',
                    _id: '$student._id',
                }
            },
            { $project: { last_name: 1, first_name: 1 } },
        ]).toArray();

        res.json(students);
    });

    //Ajouter un élève
    app.post('/classes/:classeId/students', async (req, res) => {
        const { classeId } = req.params;
        const { last_name, first_name } = req.body;
        const _id = new ObjectID(classeId);

        const { value } = await classesCollection.findOneAndUpdate({
            _id
        }, {
            $push: { student: { last_name, first_name, _id: new ObjectID() } }
        }, {
            returnOriginal: false,
        })
        res.json({ value });
    });

    //Modifier un élève
    app.post('/classes/:classeId/students/:studentId', async (req, res) => {
        const { classeId, studentId } = req.params;
        const { last_name, first_name } = req.body;
        const _id = new ObjectID(classeId);
        const _studentId = new ObjectID(studentId);

        const { value } = await classesCollection.findOneAndUpdate({
            _id,
            'student._id': _studentId
        }, {
            $set: {
                'student.$.last_name': last_name,
                'student.$.first_name': first_name,
            }
        }, {
            returnOriginal: false,
        });
        res.json({ value });
    });

    //Supprimer un cours
    app.delete('/classes/:classeId/students/:studentId', async (req, res) => {
        const { classeId, studentId } = req.params;
        const _id = new ObjectID(classeId);
        const _studentId = new ObjectID(studentId);

        const { value } = await classesCollection.findOneAndUpdate({
            _id
        }, {
            $pull: {
                student:
                {
                    _id: _studentId
                }
            }
        }, {
            returnOriginal: false,
        })
        res.json({ value });
    });
}