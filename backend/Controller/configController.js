import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ButtonValidator } from '../Util/ButtonValitador.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CONFIG_PATH = path.join(__dirname, 'config.json');

// Função para ler o config.json
function readConfig() {
  try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf8');
    const config = JSON.parse(data);
    // Garante que controls é sempre objeto
    if (!config.controls || Array.isArray(config.controls)) {
      config.controls = { buttons: [], faders: [] };
    } else {
      if (!Array.isArray(config.controls.buttons)) config.controls.buttons = [];
      if (!Array.isArray(config.controls.faders)) config.controls.faders = [];
    }
    return config;
  } catch (err) {
    // Retorna estrutura padrão se não existir ou erro
    return { credentials: {}, controls: { buttons: [], faders: [] } };
  }
}

// Função para salvar no config.json
function writeConfig(data) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
}

export default (app) => {
  // GET para obter config
  app.get('/api/config', (req, res) => {
    const data = readConfig();
    res.json(data);
  });

  // POST para salvar config (credenciais e controles)
  app.post('/api/config', (req, res) => {
    const body = req.body;
    const current = readConfig();

    // Atualiza credenciais se vierem
    if (body.credentials) {
      current.credentials = body.credentials;
    }

    // Atualiza controles se vierem (e for objeto)
    if (body.controls && typeof body.controls === 'object' && !Array.isArray(body.controls)) {
      current.controls = {
        ...current.controls,
        ...body.controls
      };
      if (!Array.isArray(current.controls.buttons)) current.controls.buttons = [];
      if (!Array.isArray(current.controls.faders)) current.controls.faders = [];
    }

    writeConfig(current);
    console.log('Configurações salvas:', current);
    res.json({ message: 'Configurações salvas com sucesso!' });
  });

  // POST para adicionar/atualizar apenas os botões
  app.post('/api/buttons', (req, res) => {
    try {
      const { buttons } = req.body;
      console.log('Recebido no /api/buttons:', buttons);

      if (!Array.isArray(buttons)) {
        console.error('Formato inválido para buttons:', req.body);
        return res.status(400).json({ message: 'Formato inválido para buttons' });
      }

      const current = readConfig();
      if (!current.controls) current.controls = {};
      if (!Array.isArray(current.controls.buttons)) current.controls.buttons = [];

      const sanitizedButtons = [];

      for (const newBtn of buttons) {
        const { isValid, sanitized, errors } = ButtonValidator.validate(newBtn);

        if (!isValid) {
          console.error(`Erro ao validar botão notation=${newBtn.notation}:`, errors);
          return res.status(400).json({ message: `Erro ao validar botão notation=${newBtn.notation}`, errors });
        }
        const idx = current.controls.buttons.findIndex(b => b.notation === newBtn.notation);
        if (idx !== -1) {
          current.controls.buttons[idx] = sanitized;
        } else {
          current.controls.buttons.push(sanitized);
        }

        sanitizedButtons.push(sanitized);
      }

      writeConfig(current);
      console.log('Botões salvos:', sanitizedButtons);
      res.json({ message: 'Botões salvos com sucesso!', saved: sanitizedButtons });
    } catch (err) {
      console.error('Erro inesperado no /api/buttons:', err);
      res.status(500).json({ message: 'Erro interno no servidor', error: err.message });
    }
  });

  // POST para adicionar/atualizar apenas os faders
  app.post('/api/faders', (req, res) => {
    const { faders } = req.body;
    console.log('Recebido no /api/buttons:', faders);
    if (!Array.isArray(faders)) {
      return res.status(400).json({ message: 'Formato inválido para faders' });
    }
    const current = readConfig();
    if (!current.controls) current.controls = {};
    current.controls.faders = faders;
    writeConfig(current);
    res.json({ message: 'Faders salvos com sucesso!' });
  });

  // GET para obter informações de um botão pelo notation
  app.get('/api/button/:notation', (req, res) => {
    const notation = parseInt(req.params.notation, 10);
    if (isNaN(notation)) {
      return res.status(400).json({ message: 'Notation inválido' });
    }
    const current = readConfig();
    const button = Array.isArray(current?.controls?.buttons)
      ? current.controls.buttons.find(b => b.notation === notation)
      : undefined;
    if (!button) {
      // Retorna um objeto padrão ao invés de 404
      return res.json({
        notation,
        colorName: 'Off',
        type: 0,
        executor: '101',
        page: 0
      });
    }
    res.json(button);
  });

  // GET para obter informações de um fader pelo index
  app.get('/api/fader/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);
    if (isNaN(index)) {
      return res.status(400).json({ message: 'Index inválido' });
    }
    const current = readConfig();
    const fader = Array.isArray(current?.controls?.faders)
      ? current.controls.faders.find(f => f.index === index)
      : undefined;
    if (!fader) {
      // Retorna um objeto padrão ao invés de 404
      return res.json({
        index,
        executor: '1',
        page: 0
      });
    }
    res.json(fader);
  });
};
