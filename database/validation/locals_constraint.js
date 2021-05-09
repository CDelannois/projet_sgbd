module.exports = async (db) => {
    const collectionName = "locals";
    const existingCollections = await db.listCollections().toArray();
    if (existingCollections.some(c => c.name === collectionName)) {
        return;
    }

    await db.createCollection(collectionName, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["label", "type"],
                properties: {
                    label: {
                        bsonType: "string",
                        description: "must be a string and is required",
                    },
                    type: {
                        bsonType: "string",
                        description: "must be a string and is required",
                            }
                         }
                    }
                },
                    
            })
        }
