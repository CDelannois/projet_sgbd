module.exports = async (db) => {
    const collectionName = "classes";
    const existingCollections = await db.listCollections().toArray();
    if (existingCollections.some(c => c.name === collectionName)) {
        return;
    }

    await db.createCollection(collectionName, {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["label", "option", "local"],
                properties: {
                    label: {
                        bsonType: "string",
                        description: "must be a string and is required",
                    },
                    option: {
                        bsonType: "string",
                        description: "must be a string and is required",
                    },
                    local: {
                        bsonType: "string",
                        description: "must be a date and is required",
                    }
                }
            }
        }
    }
    )
}