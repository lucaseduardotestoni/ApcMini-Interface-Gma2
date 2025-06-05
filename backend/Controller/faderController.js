// controller/buttonController.js
import express from 'express';
import { readConfig, writeConfig } from '../Model/configModel.js';

const router = express.Router();

// GET para obter informações de um fader pelo notation
router.get('/api/fader/:notation', (req, res) => {
  const notation = parseInt(req.params.notation, 10);
  if (isNaN(notation)) {
    return res.status(400).json({ message: 'notation inválido' });
  }
  const current = readConfig();
  const fader = Array.isArray(current?.controls?.faders)
    ? current.controls.faders.find(f => f.notation === notation)
    : undefined;
  if (!fader) {
    // Retorna um objeto padrão ao invés de 404
    return res.json({
      notation,
      executor: '1',
      page: 0
    });
  }
  res.json(fader);
});

// GET para obter todos os faders
router.get('/api/faders', (req,res) => {
  const current = readConfig();
  const faders = Array.isArray(current?.controls?.faders)
    ? current.controls.faders
    : [];
  res.json(faders);
});

// POST para adicionar/atualizar apenas os faders
router.post('/api/faders', (req, res) => {
  const { faders } = req.body;
  console.log('Recebido no /api/faders:', faders);
  if (!Array.isArray(faders)) {
    return res.status(400).json({ message: 'Formato inválido para faders' });
  }
  const current = readConfig();
  if (!current.controls) current.controls = {};
  current.controls.faders = faders;
  writeConfig(current);
  res.json({ message: 'Faders salvos com sucesso!' });
});

export default router;
