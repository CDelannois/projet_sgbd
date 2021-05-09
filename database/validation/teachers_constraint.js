module.exports = async (db) => {
    const collectionName = "teachers";
    const existingCollections = await db.listCollections().toArray();
    if (existingCollections.some(c => c.name === collectionName)) {
        return;
    }

    await db.createCollection(collectionName, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["first_name", "last_name", "discipline", "course"],
                properties: {
                    first_name: {
                        bsonType: "string",
                        description: "must be a string and is required",
                    },
                    last_name: {
                        bsonType: "string",
                        description: "must be a string and is required",
                    },
                    discipline: {
                        bsonType: "string",
                        description: "must be a string and is required",
                    },
                    
                    course: {
                        bsonType: "array",
                        items: {
                            bsonType: "object",
                            required: ["intervention_date", "object", "group"],
                            properties: {
                                label: {
                                    bsonType: "date",
                                    description: "must be a date and is required",
                                },
                                grade: {
                                    bsonType="string",
                                    description: "must be a string and is required",
                                },
                                group: {
                                    bsonType="string",
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