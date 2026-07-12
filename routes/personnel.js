import express from 'express';
import Personnel from '../models/Personnel.js';

const router = express.Router();

// GET /personnel - ?site=Site-19 rides the compound index;
// ?site=Site-17&minClearance=3 uses both fields of it
router.get('/', async (req, res) => {
    const filter = {};
    if (req.query.site) filter.site = req.query.site;
    if (req.query.designation) filter.designation = req.query.designation;
    if (req.query.minClearance) filter.clearanceLevel = { $gte: Number(req.query.minClearance) };
    if (req.query.active !== undefined) filter.active = req.query.active === 'true';//this one is tough...

    const personnel = await Personnel.find(filter).sort({ clearanceLevel: -1 });
    res.json(personnel);//bad approach b4, now sort() chains onto the query before await executes, let mongo do the sorting
});

//GET /personnel/:id ---- forgot this one too, for handling Casterrors
router.get('/:id', async (req, res) => {
    const person = await Personnel.findById(req.params.id);
    if (!person) return res.status(404).json({ error: 'Personnel record not found' });
    res.json(person);
});

// POST /personnel
router.post('/', async (req, res) => {
    const person = await Personnel.create(req.body);
    res.status(201).json(person);
});

// PATCH /personnel/:id
router.patch('/:id', async (req, res) => {
    const person = await Personnel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!person) return res.status(404).json({ error: 'Personnel record not found' });
    res.json(person);
});

// DELETE /personnel/:id
router.delete('/:id', async (req, res) => {
    const person = await Personnel.findByIdAndDelete(req.params.id);
    if (!person) return res.status(404).json({ error: 'Personnel record not found' });
    res.json({ message: `${person.name} removed from active roster`, deleted: person });
});

export default router;