//main server
import express from 'express';
import connectDB from './db/conn.js';
import scpRoutes from './routes/scps.js';
import personnelRoutes from './routes/personnel.js';
import incidentRoutes from './routes/incidents.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(express.json()); //this should parse json requests

// ---- Routes ----
// Root route: I want this to confirm the server is alive
app.get('/', (req, res) => {
    res.json({ message: 'SCP Foundation Database - Secure. Contain. Protect.' }); //i know...corny as hell
});

// Routers
app.use('/scps', scpRoutes);
app.use('/personnel', personnelRoutes);
app.use('/incidents', incidentRoutes);

// ---- 404 catch-all ----
app.use((req, res) => {
    res.status(404).json({ error: 'Resource not found or above clearance level.' });
});

// ---- error handler ----
app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    //for invalid ObjectId in :id param
    if (err.name === 'CastError') {
        return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });//typo error here with err.path
    } 
    //for Duplicate keys and handling unique index
    //400 = you sent bad data, 409 = conflict with existing data, 500 = our fault
    if (err.code === 11000) {
        return res.status(409).json({ error: `Duplicate value: ${JSON.stringify(err.keyValue)}`});
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

// ---- start ----
// Connect to the database BEFORE accepting requests
await connectDB();

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});