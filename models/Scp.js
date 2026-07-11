import mongoose from 'mongoose';

const scpSchema = new mongoose.Schema({
    itemNumber: {
        type: String,
        required: [true, 'Item number is required'],
        unique: true, //this should create a unique index for this field
        match: [/^SCP-\d{3,4}$/, 'Format must be SCP-### or SCP-####'],
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    objectClass: {
        type: String,
        required: true,
        enum: {
            values: ['Safe', 'Euclid', 'Keter', 'Thaumiel', 'Neutralized'],
            message: '{VALUE} is not a recognized object class',
        },
    },
    series: {
        type: Number,
        required: true,
        min: 1,
    },
    containmentProcedures: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    //Alot of writing is done in these fields: ideally on a live site this updates constantly. 
    //Deliberately not indexed
    rating: {
        type: Number,
        default: 0,
    },
},
{ timestamps: true }
);

//I want all Keter-class anomalies as the canonical filter for the app and to be indexed
scpSchema.index({ objectClass: 1 });

export default mongoose.model('Scp', scpSchema);