import { readConfig, writeConfig } from '../Model/configModel.js';
import express from 'express';
const router = express.Router();

router.get('/api/knob/:notation', (req, res) => {
  const notation = parseInt(req.params.notation, 10);
  if (isNaN(notation)) {
    return res.status(400).json({ message: 'Notation inválido' });
  }
  
  const current = readConfig();
  const knob = Array.isArray(current?.controls?.knobs)
    ? current.controls.knobs.find(k => k.notation === notation)
    : undefined;
  
  if (!knob) {
    // Retorna um objeto padrão ao invés de 404
    return res.json({
      notation,
      type: 0,
      executor: '101',
      page: 0
    });
  }
  
  res.json(knob);
});

router.get('/api/knobs', (req, res) => {
  const current = readConfig();
  const knobs = Array.isArray(current?.controls?.knobs)
    ? current.controls.knobs
    : [];
  res.json(knobs);
});

router.post('/api/knobs', (req, res) => {
  const { knobs } = req.body;

  if (!Array.isArray(knobs)) {
    return res.status(400).json({ message: 'Formato inválido para knobs' });
  }

  const current = readConfig();
  if (!current.controls) current.controls = {};
  current.controls.knobs = knobs;
  
  writeConfig(current);
  res.json({ message: 'Knobs salvos com sucesso!' });
});

export default router;