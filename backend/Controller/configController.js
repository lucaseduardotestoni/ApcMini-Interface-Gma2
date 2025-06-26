import express from 'express';
import { readConfig, writeConfig } from '../Model/configModel.js';
import hashPasswordMD5 from '../Service/cryptoService.js';

const router = express.Router();

router.post('/api/config', (req, res) => {
  try {
    const body = req.body;
    const current = readConfig();

    if (body.credentials) {
      const { username, password } = body.credentials;

      if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Senha inválida.' });
      }

      current.credentials = {
        username,
        password: hashPasswordMD5(password),
      };
    }

    writeConfig(current);
    res.json({ message: 'Configuração salva com sucesso!' });
  } catch (err) {
    console.error('Erro ao salvar config:', err.message);
    res.status(500).json({ error: 'Erro interno ao salvar config.' });
  }
});

router.get('/api/config', (req, res) => {
  const current = readConfig();
  res.json(current);
});

export default router;
