module.exports = async (db) => {
    const collectionName = "computers";
    const existingCollections = await db.listCollections().toArray();
    if (existingCollections.some(c => c.name === collectionName)) {
        return;
    }

    await db.createCollection(collectionName, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["computer_name", "operating_system", "disk_type", "disk_capacity", "installation"],
                properties: {
                    computer_name: {
                        bsonType: "string",
                        description: "must be a string and is required",
                    },
                    operating_system: {
                        bsonType: "string",
                        description: "must be a string and is required",
                    },
                    disk_type: {
                        bsonType: "string",
                        description: "must be a string and is required",
                    },
                    disk_capacity: {
                        bsonType: "string",
                        description: "must be a string and is required",
                    },
                    installation: {
                        bsonType: "date",
                        description: "must be a date and is required",
                    },
                    softwares: {
                        bsonType: "array",
                        items: {
                            bsonType: "object",
                            required: ["name", "description"],
                            properties: {
                                name: {
                                    bsonType: "string",
                                    description: "must be a string and is required",
                                },
                                description: {
                                    bsonType: "string",
                                    description: "must be a string and is required",
                                }
                            }
                        }
                    },
                    interventions: {
                        bsonType: "array",
                        items: {
                            bsonType: "object",
                            required: ["intervention_date", "object"],
                            properties: {
                                intervention_date: {
                                    bsonType: "date",
                                    description: "must be a date and is required",
                                },
                                object: {
                                    bsonType: "string",
                                    description: "must be a string and is required",
                                }
                            }
                        }
                    }
                },
            },
        },
    });
};