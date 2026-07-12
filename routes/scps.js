import express from 'express';
import Scp from '../models/Scp.js';

const router = express.Router();

//GET /scps list with optional filters that connect indexes
router.get('/', async (req, res) => {
    const filter = {};
    if (req.query.objectClass) filter.objectClass = req.query.objectClass;//try GET /scps?objectClass=Keter
    if (req.query.series) filter.series = Number(req.query.series);

    const scps = await Scp.find(filter).sort({ itemNumber: 1 });
    res.json(scps);
});

//GET /scp/:id forgot this one
router.get('/:id', async (req, res) => {
    const scp = await Scp.findById(req.params.id);
    if (!scp) return res.status(404).json({ error: 'SCP not found in database' });
    res.json(scp);
});

//POST /scps Mongoose validators run automatically on create hopefully
router.post('/', async (req, res) => {
    const scp = await Scp.create(req.body);
    res.status(201).json(scp); //201 = Created
});

//PATCH /scps/:id - partial update
router.patch('/:id', async (req, res) => {
    const scp = await Scp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,  //returns the updated doc
        runValidators: true, 
    });
    if (!scp) return res.status(404).json({ error: 'SCP not found in database' });
    res.json(scp);//404 = well-formed id
});

//DELETE /scps/:id
router.delete('/:id', async (req, res) => {
    const scp = await Scp.findByIdAndDelete(req.params.id);
    if (!scp) return res.status(404).json({ error: 'SCP not found in database' });
    res.json ({ message: `${scp.itemNumber} decommissioned`, deleted: scp });
});

export default router;