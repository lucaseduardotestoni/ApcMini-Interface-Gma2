// backend/server.js
import express from 'express';
import registerRoutes from './routes.js';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware para interpretar JSON no corpo da requisição
app.use(express.json());
app.use(cors()); // Permite todas as origens por padrão

// Registro das rotas
registerRoutes(app);

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
