//main server
import express from 'express';
import connectDB from './db/conn.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(express.json()); //this should parse json requests

// ---- Routes ----
// Root route: I want this to confirm the server is alive
app.get('/', (req, res) => {
    res.json({ message: 'SCP Foundation Database - Secure. Contain. Protect.' }); //i know...corny as hell
});

// ---- For later ----
// Routers
// app.use('/scps', scpRoutes);
// app.use('/personnel', personnelRoutes);
// app.use('/incidents', incidentRoutes);

// ---- 404 catch-all ----
app.use((req, res) => {
    res.status(404).json({ error: 'Resource not found or above clearance level.' });
});

// ---- start ----
// Connect to the database BEFORE accepting requests
await connectDB();

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});