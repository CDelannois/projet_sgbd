const {
    Db,
    ObjectID
} = require('mongodb');

const validation = require('./validators/computer_validation');

module.exports = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error('Invalid Dabatase');
    }

    const computersCollection = db.collection("computers");

    //Lister les ordinateurs
    app.get('/computers', async (req, res) => {
        try {
            const computers = await computersCollection.find().toArray();

            res.json(computers);
        } catch (err) {
            return res.status(400).json({
                error: "Something went wrong!"
            }),
                console.error(`An error occured : ${err}`)
        }
    });

    //Lister un ordinateur
    app.get('/computers/:computerId', async (req, res) => {
        try {
            const {
                computerId
            } = req.params;
            const _id = new ObjectID(computerId);
            const computer = await computersCollection.findOne({
                _id
            });
            if (computer == null) {
                res.status(404).send({
                    error: "Impossible to find this computer"
                });
            }

            res.json(computer);
        } catch (err) {
            return res.status(400).json({
                error: "Something went wrong!"
            }),
                console.error(`An error occured : ${err}`)
        }
    });

    //Créer un ordinateur
    app.post('/computers', async (req, res) => {
        const data = req.body;
        try {

            let computer_ok = validation.computer_validation(data.computer_name, data.operating_system, data.disk_type, data.disk_capacity, data.installation)
            if (computer_ok == true) {
                data.installation = new Date(data.installation);
                const response = await db.collection("computers").insertOne(data);

                if (response.result.n !== 1 && response.result.ok !== 1) {
                    return res.status(400).json({
                        error: 'impossible to create computer!'
                    });
                }
                const [computer] = response.ops;

                res.json({
                    computer
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


    //Mettre à jour un ordinateur
    app.post('/computers/:computerId', async (req, res) => {
        try {
            const {
                computerId
            } = req.params;
            const data = req.body;

            let computer_ok = validation.computer_validation(data.computer_name, data.operating_system, data.disk_type, data.disk_capacity, data.installation)
            if (computer_ok == true) {

                const _id = new ObjectID(computerId);
                const response = await computersCollection.findOneAndUpdate({
                    _id
                }, {
                    $set: data
                }, {
                    returnOriginal: false
                });
                if (response.ok !== 1) {
                    return res.status(400).json({
                        error: 'Impossible to update the computer'
                    });
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
                error: "Something went wrong!"
            }),
                console.error(`An error occured : ${err}`)
        }
    });

    //Supprimer un ordinateur
    app.delete('/computers/:computerId', async (req, res) => {
        try {
            const {
                computerId
            } = req.params;
            const _id = new ObjectID(computerId);

            const response = await computersCollection.findOneAndDelete({
                _id
            });

            if (response.value === null) {
                return res.status(404).send({
                    error: "This computer doesn't exist."
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

    //_____________________________________________________________________Logiciels_____________________________________________________________________________________________

    //Récupération de tous les logiciels
    app.get("/computers/:computerId/softwares", async (req, res) => {
        try {
            const {
                computerId
            } = req.params;

            const softwares = await computersCollection.aggregate([{
                $match: {
                    _id: new ObjectID(computerId)
                }
            },
            {
                $unwind: '$software'
            },
            {
                $project: {
                    software: 1,
                    _id: 0
                }
            },
            {
                $addFields: {
                    name: '$software.name',
                    description: '$software.description',
                    _id: '$software._id',
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1
                }
            },
            ]).toArray();

            res.json(softwares);
        } catch (err) {
            return res.status(400).json({
                error: "Something went wrong!"
            }),
                console.error(`An error occured : ${err}`)
        }
    });

    //Ajouter un logiciel
    app.post('/computers/:computerId/softwares', async (req, res) => {
        try {
            const {
                computerId
            } = req.params;
            const {
                name,
                description
            } = req.body;
            const _id = new ObjectID(computerId);

            let software_ok = validation.software_validation(name, description)
            if (software_ok == true) {
                const {
                    value
                } = await computersCollection.findOneAndUpdate({
                    _id
                }, {
                    $push: {
                        software: {
                            name,
                            description,
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

    //Modifier un logiciel
    app.post('/computers/:computerId/softwares/:softwareId', async (req, res) => {
        try {
            const {
                computerId,
                softwareId
            } = req.params;
            const {
                name,
                description
            } = req.body;
            const _id = new ObjectID(computerId);
            const _softwareId = new ObjectID(softwareId);

            let software_ok = validation.software_validation(name, description)
            if (software_ok == true) {
                const {
                    value
                } = await computersCollection.findOneAndUpdate({
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
                res.json({
                    value
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

    //Supprimer un logiciel
    app.delete('/computers/:computerId/softwares/:softwareId', async (req, res) => {
        try {
            const {
                computerId,
                softwareId
            } = req.params;
            const _id = new ObjectID(computerId);
            const _softwareId = new ObjectID(softwareId);

            const {
                value
            } = await computersCollection.findOneAndUpdate({
                _id
            }, {
                $pull: {
                    software: {
                        _id: _softwareId
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

    //_____________________________________________________________________Interventions________________________________________________________________________________________

    //Récupération de toutes les interventions
    app.get("/computers/:computerId/interventions", async (req, res) => {
        try {
            const {
                computerId
            } = req.params;

            const interventions = await computersCollection.aggregate([{
                $match: {
                    _id: new ObjectID(computerId)
                }
            },
            {
                $unwind: '$intervention'
            },
            {
                $project: {
                    intervention: 1,
                    _id: 0
                }
            },
            {
                $addFields: {
                    intervention_date: '$intervention.intervention_date',
                    object: '$intervention.object',
                    _id: '$intervention._id',
                }
            },
            {
                $project: {
                    intervention_date: 1,
                    object: 1
                }
            },
            ]).toArray();

            res.json(interventions);
        } catch (err) {
            return res.status(400).json({
                error: "An error occured : " + err
            });
        }
    });

    //Ajouter une intervention
    app.post('/computers/:computerId/interventions', async (req, res) => {
        try {
            const {
                computerId
            } = req.params;
            const {
                date,
                object
            } = req.body;
            const intervention_date = new Date(date);
            const _id = new ObjectID(computerId);

            let intervention_ok = validation.intervention_validation(date, object);

            if (intervention_ok == true) {
                const {
                    value
                } = await computersCollection.findOneAndUpdate({
                    _id
                }, {
                    $push: {
                        intervention: {
                            intervention_date,
                            object,
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

    //Modifier une intervention
    app.post('/computers/:computerId/interventions/:interventionId', async (req, res) => {
        try {
            const {
                computerId,
                interventionId
            } = req.params;
            const {
                date,
                object
            } = req.body;
            const intervention_date = new Date(date)
            const _id = new ObjectID(computerId);
            const _interventionId = new ObjectID(interventionId);

            let intervention_ok = validation.intervention_validation(date, object);

            if (intervention_ok == true) {
                const {
                    value
                } = await computersCollection.findOneAndUpdate({
                    _id,
                    'intervention._id': _interventionId
                }, {
                    $set: {
                        'intervention.$.intervention_date': intervention_date,
                        'intervention.$.object': object,
                    }
                }, {
                    returnOriginal: false,
                });
                res.json({
                    value
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

    //Supprimer une intervention
    app.delete('/computers/:computerId/interventions/:interventionId', async (req, res) => {
        try {
            const {
                computerId,
                interventionId
            } = req.params;
            const _id = new ObjectID(computerId);
            const _interventionId = new ObjectID(interventionId);

            const {
                value
            } = await computersCollection.findOneAndUpdate({
                _id
            }, {
                $pull: {
                    intervention: {
                        _id: _interventionId
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
}