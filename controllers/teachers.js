const {
    Db,
    ObjectID
} = require('mongodb');

const validation = require('./validators/teacher_validation');



module.exports = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error('Invalid Dabatase');
    }

    const teachersCollection = db.collection("teachers");

    //Lister les professeurs
    app.get('/teachers', async (req, res) => {
        try {
            const teachers = await teachersCollection.find().toArray();

            res.json(teachers);
        } catch (err) {
            return res.status(400).json({
                error: "Something went wrong!"
            }),
                console.error(`An error occured : ${err}`)
        }
    });

    //Lister un professeur
    app.get('/teachers/:teacherId', async (req, res) => {
        try {
            const {
                teacherId
            } = req.params;
            const _id = new ObjectID(teacherId);
            const teacher = await teachersCollection.findOne({
                _id
            });
            if (teacher == null) {
                res.status(404).send({
                    error: "Impossible to find this teacher"
                });
            }

            res.json(teacher);
        } catch (err) {
            return res.status(400).json({
                error: "Something went wrong!"
            }),
                console.error(`An error occured : ${err}`)
        }
    });

    //Créer un professeur
    app.post('/teachers', async (req, res) => {
        const data = req.body;
        try {
            let teacher_ok = validation.teacher_validation(data.first_name, data.last_name, data.discipline);

            if (teacher_ok == true) {
                const response = await db.collection("teachers").insertOne(data);
                if (response.result.n !== 1 && response.result.ok !== 1) {
                    return res.status(400).json({
                        error: 'impossible to create teacher!'
                    });
                }
                const [teacher] = response.ops;

                res.json({
                    teacher
                });
            } else {
                console.log("One or several fields aren't correctly filled.");
                return res.status(400).json({
                    error: "One or several fields aren't correctly filled."
                })
            }
        } catch (err) {
            return res.status(400).json({
                error: "Something went wrong!"
            }),
                console.error(`An error occured : ${err}`)
        }
    });


    //Mettre à jour un professeur
    app.post('/teachers/:teacherId', async (req, res) => {
        try {
            const {
                teacherId
            } = req.params;
            const data = req.body;

            const _id = new ObjectID(teacherId);

            let teacher_ok = validation.teacher_validation(data.first_name, data.last_name, data.discipline);

            if (teacher_ok == true) {
                const response = await teachersCollection.findOneAndUpdate({
                    _id
                }, {
                    $set: data
                }, {
                    returnOriginal: false
                });
                if (response.ok !== 1) {
                    return res.status(400).json({
                        error: 'Impossible to update the teacher'
                    });
                }
                res.json(response.value);
            } else {
                console.log("One or several fields aren't correctly filled.");
                res.status(400).json({
                    error: "One or several fields aren't properly filled."
                })
            }

        } catch (err) {
            return res.status(400).json({
                error: "Something went wrong!"
            }),
                console.error(`An error occured : ${err}`)
        }


    });

    //Supprimer un professeur
    app.delete('/teachers/:teacherId', async (req, res) => {
        try {
            const {
                teacherId
            } = req.params;
            const _id = new ObjectID(teacherId);

            const response = await teachersCollection.findOneAndDelete({
                _id
            });

            if (response.value === null) {
                return res.status(404).send({
                    error: "This teacher doesn't exist."
                })
            }

            res.status(204).send();
        } catch (err) {
            return res.status(400).json({
                error: "Something went wrong!"
            }),
                console.error(`An error occured : ${err}`)
        }
    });

    //_____________________________________________________________________Cours______________________________________________________________________________________________

    //Récupération de tous les cours
    app.get("/teachers/:teacherId/courses", async (req, res) => {
        try {
            const {
                teacherId
            } = req.params;

            const courses = await teachersCollection.aggregate([{
                $match: {
                    _id: new ObjectID(teacherId)
                }
            },
            {
                $unwind: '$course'
            },
            {
                $project: {
                    course: 1,
                    _id: 0
                }
            },
            {
                $addFields: {
                    label: '$course.label',
                    grade: '$course.grade',
                    group: '$course.group',
                    _id: '$course._id',
                }
            },
            {
                $project: {
                    label: 1,
                    grade: 1,
                    group: 1
                }
            },
            ]).toArray();

            res.json(courses);
        } catch (err) {
            return res.status(400).json({
                error: "Something went wrong!"
            }),
                console.error(`An error occured : ${err}`)
        }
    });

    //Ajouter un cours
    app.post('/teachers/:teacherId/courses', async (req, res) => {
        try {
            const {
                teacherId
            } = req.params;
            const {
                label,
                grade,
                group
            } = req.body;
            const _id = new ObjectID(teacherId);

            let course_ok = validation.course_validation(label, grade, group);

            if (course_ok == true) {
                const {
                    value
                } = await teachersCollection.findOneAndUpdate({
                    _id
                }, {
                    $push: {
                        course: {
                            label,
                            grade,
                            group,
                            _id: new ObjectID()
                        }
                    }
                }, {
                    returnOriginal: false,
                })
                res.json({
                    value
                });
            } else {
                console.log("One or several fields aren't correctly filled.");
                res.status(400).json({
                    error: "One or several fields aren't properly filled."
                })
            }
        } catch (err) {
            return res.status(400).json({
                error: "Something went wrong!"
            }),
                console.error(`An error occured : ${err}`)
        }
    });

    //Modifier un cours
    app.post('/teachers/:teacherId/courses/:courseId', async (req, res) => {
        try {
            const {
                teacherId,
                courseId
            } = req.params;
            const {
                label,
                grade,
                group
            } = req.body;
            const _id = new ObjectID(teacherId);
            const _courseId = new ObjectID(courseId);

            let course_ok = validation.course_validation(label, grade, group);

            if (course_ok == true) {
                const {
                    value
                } = await teachersCollection.findOneAndUpdate({
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
                res.json({
                    value
                });
            } else {
                console.log("One or several fields aren't correctly filled.");
                res.status(400).json({
                    error: "One or several fields aren't properly filled."
                })
            }

        } catch (err) {
            return res.status(400).json({
                error: "Something went wrong!"
            }),
                console.error(`An error occured : ${err}`)
        }
    });

    //Supprimer un cours
    app.delete('/teachers/:teacherId/courses/:courseId', async (req, res) => {
        try {
            const {
                teacherId,
                courseId
            } = req.params;
            const _id = new ObjectID(teacherId);
            const _courseId = new ObjectID(courseId);

            const {
                value
            } = await teachersCollection.findOneAndUpdate({
                _id
            }, {
                $pull: {
                    course: {
                        _id: _courseId
                    }
                }
            }, {
                returnOriginal: false,
            })
            res.json({
                value
            });
        } catch (err) {
            return res.status(400).json({
                error: "Something went wrong!"
            }),
                console.error(`An error occured : ${err}`)
        }
    });

    //________________________________________________________________________Lookup - classes________________________________________________________________________________
    //Récupération des classes où un professeur donne cours
    app.get("/teachers/:teacherId/classes", async (req, res) => {
        try {
            const {
                teacherId
            } = req.params;

            const classes = await teachersCollection.aggregate([{
                $match: {
                    _id: new ObjectID(teacherId)
                },
            },
            {
                $unwind: "$course"
            },
            {
                $lookup: {
                    from: 'classes',
                    let: {
                        course_group: "$course.group"
                    },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ["$label", "$$course_group"]
                            }
                        }
                    }],
                    as: 'teacher_class',
                }
            },
            {
                $unwind: "$teacher_class"
            },
            {
                $addFields: {
                    teacher: {
                        $concat: ["$first_name", " ", "$last_name"]
                    },
                    cours: "$course.label",
                    class: "$teacher_class.label",
                    option: "$teacher_class.option",
                    local: "$teacher_class.local",

                }
            },
            {
                $project: {
                    _id: 0,
                    teacher: 1,
                    cours: 1,
                    class: 1,
                    option: 1,
                    local: 1,
                },
            },
            {
                $group: {
                    _id: "$teacher",
                    classes: {
                        $push: "$$ROOT"
                    }
                }
            },
            ]).toArray();

            res.json(classes);
        } catch (err) {
            return res.status(400).json({
                error: "Something went wrong!"
            }),
                console.error(`An error occured : ${err}`)
        }
    });
}