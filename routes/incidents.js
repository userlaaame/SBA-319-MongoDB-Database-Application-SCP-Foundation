import express from 'express';
import IncidentReport from '../models/IncidentReport.js';

const router = express.Router();

// GET /incidents - populated refs turn ObjectIds into readable subdocuments.
// Filters: ?severity=Containment%20Breach, ?scp=<scpObjectId>
// The ?scp filter + newest-first sort is THE query the
// { scp: 1, occurredAt: -1 } compound index was built for.
router.get('/', async (req, res) => {
    const filter = {};
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.scp) filter.scp = req.query.scp;

    const incidents = await IncidentReport.find(filter)
        .sort({ occuredAt: -1 })
        .populate('scp', 'itemNumber title objectClass')//same principle as $project
        .populate('reportedBy', 'name designation site');
    res.json(incidents);
});

// GET/incidents/:id
router.get('/:id', async (req, res) => {
    const incident = await IncidentReport.findById(req.params.id)
    .populate('scp', 'itemNumber title objectClass')
    .populate('reportedBy', 'name designation site');
    if (!incident) return res.status(404).json({ error: 'Incident report not found' });
    res.json(incident);
});

// POST /incidents - body supplies raw ObjectIds for scp and reportedBy
router.post('/', async (req, res) => {
  const incident = await IncidentReport.create(req.body);
  res.status(201).json(incident);
});

// PATCH /incidents/:id
router.patch('/:id', async (req, res) => {
  const incident = await IncidentReport.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!incident) return res.status(404).json({ error: 'Incident report not found' });
  res.json(incident);
});

// DELETE /incidents/:id
router.delete('/:id', async (req, res) => {
  const incident = await IncidentReport.findByIdAndDelete(req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident report not found' });
  res.json({ message: 'Incident report expunged', deleted: incident });
});

export default router;
