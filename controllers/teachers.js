const { Db, ObjectID } = require('mongodb');

module.exports = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error('Invalid Dabatase');
    }

    const teachersCollection = db.collection("teachers");

    //Lister les professeurs
    app.get('/teachers', async (req, res) => {
        const teachers = await teachersCollection.find().toArray();

        res.json(teachers);
    });

    //Lister un professeur
    app.get('/teachers/:teacherId', async (req, res) => {
        try {
            const { teacherId } = req.params;
            const _id = new ObjectID(teacherId);
            const teacher = await teachersCollection.findOne({ _id });
            if (teacher == null) {
                res.status(404).send({ error: "Impossible to find this teacher" });
            }

            res.json(teacher);
        }
        catch (err) {
            console.error(`An error occured : ${err}`)
        }
    });

    //Créer un professeur
    app.post('/teachers', async (req, res) => {
        const data = req.body;
        try {
            const response = await db.collection("teachers").insertOne(data);

            if (response.result.n !== 1 && response.result.ok !== 1) {
                return res.status(400).json({ error: 'impossible to create teacher!' });
            }
            const [teacher] = response.ops;

            res.json({ teacher });
        }
        catch (err) {
            console.error(`An error occured : ${err}`)
            res.json(err)
        }
    });


    //Mettre à jour un professeur
    app.post('/teachers/:teacherId', async (req, res) => {
        const { teacherId } = req.params;
        const data = req.body;

        const _id = new ObjectID(teacherId);
        const response = await teachersCollection.findOneAndUpdate(
            { _id },
            { $set: data },
            { returnOriginal: false }
        );
        if (response.ok !== 1) {
            return res.status(400).json({ error: 'Impossible to update the teacher' });
        }

        res.json(response.value);
    });

    //Supprimer un professeur
    app.delete('/teachers/:teacherId', async (req, res) => {
        const { teacherId } = req.params;
        const _id = new ObjectID(teacherId);

        const response = await teachersCollection.findOneAndDelete({ _id });

        if (response.value === null) {
            return res.status(404).send({ error: "This teacher doesn't exist." })
        }

        res.status(204).send();
    });

    //_____________________________________________________________________Cours______________________________________________________________________________________________

    //Récupération de tous les cours
    app.get("/teachers/:teacherId/courses", async (req, res) => {
        const { teacherId } = req.params;

        const courses = await teachersCollection.aggregate([
            { $match: { _id: new ObjectID(teacherId) } },
            { $unwind: '$course' },
            { $project: { course: 1, _id: 0 } },
            {
                $addFields: {
                    label: '$course.label',
                    grade: '$course.grade',
                    group: '$course.group',
                    _id: '$course._id',
                }
            },
            { $project: { label: 1, grade: 1, group: 1 } },
        ]).toArray();

        res.json(courses);
    });

    //Ajouter un cours
    app.post('/teachers/:teacherId/courses', async (req, res) => {
        const { teacherId } = req.params;
        const { label, grade, group } = req.body;
        const _id = new ObjectID(teacherId);

        const { value } = await teachersCollection.findOneAndUpdate({
            _id
        }, {
            $push: { course: { label, grade, group, _id: new ObjectID() } }
        }, {
            returnOriginal: false,
        })
        res.json({ value });
    });

    //Modifier un cours
    app.post('/teachers/:teacherId/courses/:courseId', async (req, res) => {
        const { teacherId, courseId } = req.params;
        const { label, grade, group } = req.body;
        const _id = new ObjectID(teacherId);
        const _courseId = new ObjectID(courseId);

        const { value } = await teachersCollection.findOneAndUpdate({
            _id,
            'course._id': _courseId
        }, {
            $set: {
                'course.$.label': label,
                'course.$.grade': grade,
                'course.$.group': group,
            }
        }, {
            returnOriginal: false,
        });
        res.json({ value });
    });

    //Supprimer un cours
    app.delete('/teachers/:teacherId/courses/:courseId', async (req, res) => {
        const { teacherId, courseId } = req.params;
        const _id = new ObjectID(teacherId);
        const _courseId = new ObjectID(courseId);

        const { value } = await teachersCollection.findOneAndUpdate({
            _id
        }, {
            $pull: {
                course:
                {
                    _id: _courseId
                }
            }
        }, {
            returnOriginal: false,
        })
        res.json({ value });
    });

    //________________________________________________________________________Lookup - classes________________________________________________________________________________
    //Récupération des classes où un professeur donne cours
    app.get("/teachers/:teacherId/classes", async (req, res) => {
        const { teacherId } = req.params;

        const classes = await teachersCollection.aggregate([
            {
                $match: { _id: new ObjectID(teacherId) }
            },
            {
                $unwind: "$course"
            },
            {
                $lookup: {
                    from: 'classes',
                    let: { course_group: "$course.group" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$label", "$$course_group"]
                                }
                            }
                        }
                    ],
                    as: 'teacher_class',
                }
            },
            {
                $unwind: "$teacher_class"
            },
            {
                $addFields: {
                    teacher: { $concat: ["$first_name", " ", "$last_name"] },
                    cours: "$course.label",
                    class: "$teacher_class.label",
                    option: "$teacher_class.option",
                    local: "$teacher_class.local",

                }
            },
            {
                $project:
                {
                    _id: 0,
                    teacher: 1,
                    cours: 1,
                    class: 1,
                    option: 1,
                    local: 1,
                }
            },
            {
                $group: {
                    _id: "$teacher", classes:
                    {
                        $push: "$$ROOT"
                    }
                }
            },
        ]).toArray();

        res.json(classes);
    });
}