import express from 'express';
import MaController from '../Service/MaServiceWeb.js';

const router = express.Router();

// Rota para verificar status da conexão MA
router.get('/api/maStatus', (req, res) => {
  try {
    // 🔧 Apenas verifica se existe, sem criar
    if (!MaController.instance) {
      return res.json({
        status: false,
        session: null,
        message: 'Nenhuma conexão MA ativa',
      });
    }

    // Se existe, usa a instância existente
    const status = MaController.instance.isMAConnected();
    console.log('Status MA:', status);
    res.json({
      status: status.connected,
      session: status.session,
      port: 'localhost'
    });
  } catch (err) {
    console.error('Erro ao verificar status MA:', err.message);
    res.status(500).json({
      status: false,
      session: null,
      error: err.message,
    });
  }
});

// Rota para fechar conexão MA
router.post('/api/maClose', (req, res) => {
  try {
    // 🔧 Verifica se existe instância antes de fechar
    if (!MaController.instance) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma conexão MA ativa para fechar',
      });
    }

    // 🔧 Use .instance (propriedade) em vez de .instance() (função)
    MaController.instance.close();
    
    res.json({
      success: true,
      message: 'Conexão MA fechada com sucesso',
    });
  } catch (err) {
    console.error('Erro ao fechar conexão MA:', err.message);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;