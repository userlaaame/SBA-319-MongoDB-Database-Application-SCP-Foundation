import mongoose from "mongoose";

const personnelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    designation: {
        type: String,
        required: true,
        enum: ['Researcher', 'Agent', 'Doctor', 'MTF Operative', 'D-Class'],
    },
    clearanceLevel: {
        type: Number,
        required: true,
        min: [1, 'Clearance is Level 1 through 5'],//Numeric range validators, they should map onto $jsonSchema script
        max: [5, 'Clearance is Level 1 through 5'],
    },
    site: {
        type: String, //e.g. "site-19"
        required: true,
        trim: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
},
{ timestamps: true }
);

//A normal lookup should roster by site, and sort by clearance in descending order
personnelSchema.index({ site: 1, clearanceLevel: -1 });

export default mongoose.model('Personnel', personnelSchema);