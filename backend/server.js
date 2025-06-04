import express from 'express';
import cors from 'cors';
import configRoutes from './Controller/configController.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Rotas da API
configRoutes(app);

// Inicia servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando em http://localhost:${PORT}`);
});
