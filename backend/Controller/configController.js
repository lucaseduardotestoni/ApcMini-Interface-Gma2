import express from 'express';
import { readConfig, writeConfig } from '../Model/configModel.js';

const router = express.Router();

router.post('/api/config', (req, res) => {  
    const body = req.body;
    const current = readConfig();
    
    // Atualiza credenciais se vierem
    if (body.credentials) {
        current.credentials = body.credentials;
    }
      
    writeConfig(current);
    res.json({ message: 'Configuração salva com sucesso!' });
}); 

router.get('/api/config', (res) => {
    const current = readConfig();
    res.json(current);
});

export default router; 