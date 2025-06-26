// backend/routes/midiRoutes.js
import express from 'express';
import MidiService from '../Service/MidiService.js';

const router = express.Router();

router.get('/api/statusMidi', (req, res) => {
  const deviceName = 'APC MINI';
  const status = MidiService.isConnected(deviceName);

  res.json({
    status,
    deviceName,
    midiPort: 'USB', // pode vir de uma constante ou enum se desejar
  });
});

export default router;
