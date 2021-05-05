const {
    Db,
    ObjectID
} = require('mongodb');

const {
    default: validator
} = require('validator');

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
            const first_name = data.first_name;
            let validate_first_name;
            const last_name = data.last_name;
            let validate_last_name;
            const discipline = data.discipline;
            let validate_discipline;

            if (validator.isLength(first_name, {
                min: 2,
                max: 45
            }) && validator.isAlpha(first_name, "fr-FR", {
                ignore: " -"
            })) {
                validate_first_name = true;
            } else {
                console.log("First name is required and can only contain letters.");
                validate_first_name = false;
            }

            if (validator.isLength(last_name, {
                min: 2,
                max: 45
            }) && validator.isAlpha(last_name, "fr-FR", {
                ignore: " -"
            })) {
                validate_last_name = true;
            } else {
                console.log("Last name is required and can only contain letters.");
                validate_last_name = false;
            }

            if (validator.isLength(discipline, {
                min: 2,
                max: 45
            }) && validator.isAlpha(discipline, "fr-FR", {
                ignore: " -"
            })) {
                validate_discipline = true;
            } else {
                console.log("Disciplines is required and can only contain letters.");
                validate_discipline = false;
            }
            if (validate_discipline == true && validate_first_name == true && validate_last_name == true) {
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

            const first_name = data.first_name;
            let validate_first_name;
            const last_name = data.last_name;
            let validate_last_name;
            const discipline = data.discipline;
            let validate_discipline;

            if (validator.isLength(first_name, {
                min: 2,
                max: 45
            }) && validator.isAlpha(first_name, "fr-FR", {
                ignore: " -"
            })) {
                validate_first_name = true;
            } else {
                console.log("First name is required and can only contain letters.");
                validate_first_name = false;
            }

            if (validator.isLength(last_name, {
                min: 2,
                max: 45
            }) && validator.isAlpha(last_name, "fr-FR", {
                ignore: " -"
            })) {
                validate_last_name = true;
            } else {
                console.log("Last name is required and can only contain letters.");
                validate_last_name = false;
            }

            if (validator.isLength(discipline, {
                min: 2,
                max: 45
            }) && validator.isAlpha(discipline, "fr-FR", {
                ignore: " -"
            })) {
                validate_discipline = true;
            } else {
                console.log("Disciplines is required and can only contain letters.");
                validate_discipline = false;
            }
            if (validate_discipline == true && validate_first_name == true && validate_last_name == true) {
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

            let validate_label;
            let validate_grade;
            let validate_group;

            if (validator.isLength(label, {
                min: 2,
                max: 25
            })) {
                validate_label = true;
            } else {
                validate_label = false;
                console.log("Label is required. Max. 25 characters.")
            }

            if (validator.isLength(grade, {
                max: 25
            })) {
                validate_grade = true;
            } else {
                validate_grade = false;
                console.log("Grade is required. Max. 25 characters.")
            }
            if (validator.isLength(group, {
                max: 10
            })) {
                validate_group = true;
            } else {
                validate_group = false;
                console.log("Group is required. Max. 10 characters.")
            }

            if (validate_group == true && validate_label == true && validate_grade == true) {
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

            let validate_label;
            let validate_grade;
            let validate_group;

            if (validator.isLength(label, {
                min: 2,
                max: 25
            })) {
                validate_label = true;
            } else {
                validate_label = false;
                console.log("Label is required. Max. 25 characters.")
            }

            if (validator.isLength(grade, {
                max: 25
            })) {
                validate_grade = true;
            } else {
                validate_grade = false;
                console.log("Grade is required. Max. 25 characters.")
            }
            if (validator.isLength(group, {
                max: 10
            })) {
                validate_group = true;
            } else {
                validate_group = false;
                console.log("Group is required. Max. 10 characters.")
            }

            if (validate_group == true && validate_label == true && validate_grade == true) {
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
                _id: 0,
                teacher: 1,
                cours: 1,
                class: 1,
                option: 1,
                local: 1,
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