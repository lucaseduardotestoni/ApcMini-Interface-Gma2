import express from 'express';
import { MidiService } from '../Services/MidiService.js';
const router = express.Router();

router.get('/api/statusMidi', (req, res) => {
  const connected = MidiService.isConnected('APC MINI');
  res.json({ connected });
});

export default router;