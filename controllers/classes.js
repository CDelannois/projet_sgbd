const {
    Db, ObjectID
} = require('mongodb');

const validation = require('./validators/classes_validation');


module.exports = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error('Invalid Dabatase');
    }

    const classesCollection = db.collection("classes");

    //Lister les classes
    app.get('/classes', async (req, res) => {
        try {
            const classes = await classesCollection.find().toArray();
            if (classes == 0) {
                res.status(200).send({ ok: "There are no classes." });
            }
            res.json(classes);
        } catch (err) {
            return res.status(400).json({
                error: "An error occured : " + err
            });
        }
    });

    //Lister une classe
    app.get('/classes/:classeId', async (req, res) => {
        try {
            const { classeId } = req.params;
            const _id = new ObjectID(classeId);
            const classe = await classesCollection.findOne({ _id });
            if (classe == null) {
                res.status(404).send({ error: "This class doesn't exist." });
            }

            res.json(classe);
        } catch (err) {
            return res.status(400).json({
                error: "An error occured : " + err
            });
        }
    });

    //Créer une classe
    app.post('/classes', async (req, res) => {
        const data = req.body;
        try {

            let class_ok = validation.class_validation(data.label, data.option, data.local)

            if (class_ok == true) {
                const response = await db.collection("classes").insertOne(data);

                if (response.result.n !== 1 && response.result.ok !== 1) {
                    return res.status(400).json({ error: 'Impossible to create class :' });
                }
                const [classe] = response.ops;

                res.json({ classe });
            } else {
                console.log("One or several fields aren't correctly filled.");
                return res.status(400).json({
                    error: "One or several fields aren't correctly filled."
                })
            }
        } catch (err) {
            return res.status(400).json({
                error: "An error occured : " + err
            });
        }
    });


    //Mettre à jour une classe
    app.post('/classes/:classeId', async (req, res) => {
        try {
            const { classeId } = req.params;
            const data = req.body;

            const _id = new ObjectID(classeId);

            let class_ok = validation.class_validation(data.label, data.option, data.local)

            if (class_ok == true) {
                const response = await classesCollection.findOneAndUpdate(
                    { _id },
                    { $set: data },
                    { returnOriginal: false }
                );
                if (response.ok !== 1) {
                    return res.status(400).json({ error: 'Impossible to update the class' });
                }
                res.json(response.value);
            } else {
                console.log("One or several fields aren't correctly filled.");
                return res.status(400).json({
                    error: "One or several fields aren't correctly filled."
                })
            }
        } catch (err) {
            return res.status(400).json({
                error: "An error occured : " + err
            });
        }
    });

    //Supprimer une classe
    app.delete('/classes/:classeId', async (req, res) => {
        try {
            const { classeId } = req.params;
            const _id = new ObjectID(classeId);

            const response = await classesCollection.findOneAndDelete({ _id });

            if (response.value === null) {
                return res.status(404).send({ error: "This class doesn't exist." })
            }

            res.status(204).send();

        } catch (err) {
            return res.status(400).json({
                error: "An error occured : " + err
            });
        }
    });

    //_____________________________________________________________________Elèves_____________________________________________________________________________________________

    //Récupération de tous les élèves
    app.get("/classes/:classeId/students", async (req, res) => {
        try {
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

            if (students == 0) {
                return res.status(200).json({ error: "There are no students." });
            }

            res.json(students);
        } catch (err) {
            return res.status(400).json({
                error: "An error occured : " + err
            });
        }

    });

    //Ajouter un élève
    app.post('/classes/:classeId/students', async (req, res) => {
        try {
            const { classeId } = req.params;
            const { last_name, first_name } = req.body;
            const _id = new ObjectID(classeId);

            let student_ok = validation.student_validation(last_name, first_name)

            if (student_ok == true) {
                const { value } = await classesCollection.findOneAndUpdate({
                    _id
                }, {
                    $push: { student: { last_name, first_name, _id: new ObjectID() } }
                }, {
                    returnOriginal: false,
                })
                res.json({ value });
            } else {
                console.log("One or several fields aren't correctly filled.");
                return res.status(400).json({
                    error: "One or several fields aren't correctly filled."
                })
            }
        } catch (err) {
            return res.status(400).json({
                error: "An error occured : " + err
            });
        }
    });

    //Modifier un élève
    app.post('/classes/:classeId/students/:studentId', async (req, res) => {
        try {
            const { classeId, studentId } = req.params;
            const { last_name, first_name } = req.body;
            const _id = new ObjectID(classeId);
            const _studentId = new ObjectID(studentId);

            let student_ok = validation.student_validation(last_name, first_name)

            if (student_ok == true) {
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
            } else {
                console.log("One or several fields aren't correctly filled.");
                return res.status(400).json({
                    error: "One or several fields aren't correctly filled."
                })
            }
        } catch (err) {
            return res.status(400).json({
                error: "An error occured : " + err
            });
        }
    });

    //Supprimer un élève
    app.delete('/classes/:classeId/students/:studentId', async (req, res) => {
        try {
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
        } catch (err) {
            return res.status(400).json({
                error: "An error occured : " + err
            });
        }
    });


    //________________________________________________________________________Lookup - local____________________________________________________________________________________
    //Récupération des locaux de la classe
    app.get("/classes/:classeId/local", async (req, res) => {
        try {
            const { classeId } = req.params;

            const local = await classesCollection.aggregate([
                {
                    $lookup: {
                        from: 'locals',
                        localField: 'local',
                        foreignField: 'label',
                        as: 'local'
                    }
                }
            ]).toArray();

            if (local == 0) {

            }

            res.json(local);
        } catch (err) {
            return res.status(400).json({
                error: "An error occured : " + err
            });
        }
    });
}