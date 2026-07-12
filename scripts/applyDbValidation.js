//Mongoose changes model names which makes command errors and rejections before they reach MongoDB...
//let's put that issue on Mongo
//This applies database-level jsonSchema validation to the scps collection via collMod 
//extremely tough to make but seems very necessary 
import mongoose from 'mongoose';
import connectDB from '../db/conn.js';

await connectDB();
const db = mongoose.connection.db; //native driver handle

const scpValidator = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['itemNumber', 'title', 'objectClass', 'series', 'containmentProcedures', 'description'],
        properties: {
            itemNumber: {
                bsonType: 'string',
                pattern: '^SCP-\\d{3,4}$',
                description: 'must be a string matching SCP-### or SCP-####',
            },
            title: { bsonType: 'string' },
            objectClass: {
                enum: ['Safe', 'Euclid', 'Keter', 'Thaumiel', 'Neutralized'],
                description: 'must be a recognized object class',
            },
            series: {
                bsonType: 'number',
                minimum: 1,
                description: 'must be a number >= 1',
            },
            containmentProcedures: { bsonType: 'string' },
            description: { bsonType: 'string' },
            rating: { bsonType: 'number' },
        },
    },
};

//collMod modifies an existing collection while createCollection is for new ones
const result = await db.command({
    collMod: 'scps',    //actual collection name, not model name
    validator: scpValidator,
    validationLevel: 'strict', //should validate all inserts and updates
    validationAction: 'error', //rejects invalid writes
});
console.log('collMod applied:', result);

// === 1st Verify: read the validator back off the collection ===
const [info] = await db.listCollections({ name: 'scps' }).toArray();
console.log('Validator now on collection:',
    JSON.stringify(info.options?.validator ? Object.keys(info.options.validator) : 'NONE'));

// === 2nd Verify: prove MongoDB itself rejects bad data ===
//.collection(should bypass Mongoose validation entirely so if it fails) the rejection must be the database
try {
    await db.collection('scps').insertOne({
        itemNumber: 'NOT-A-VALID-NUMBER',
        title: 'Validation Test Subject',
        objectClass: 'Apollyon',
        series: 0,
        containmentProcedures: 'n/a',
        description: 'This document should never survive insertion.',
    });
    console.error('PROBLEM: invalid document was accepted, validator is not active!');
} catch (err) {
    console.log(`Database rejected invalid document (code ${err.code}: DocumentValidationFailure)`);
    console.log('Violated rules:', JSON.stringify(err.errInfo?.details?.schemaRulesNotSatisfied ?? 'n/a', null, 2));//let's just get along please lol
}//finally it works and god this is GOLD!!!

await mongoose.connection.close();