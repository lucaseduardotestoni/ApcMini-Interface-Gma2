// backend/server.js
import express from 'express';
import cors from 'cors';
import registerRoutes from './routes.js';
import startMidiIntegration from './Service/startMidiIntegration.js';

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());

registerRoutes(app);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  startMidiIntegration(); // Inicia controle MIDI junto com o backend
});
