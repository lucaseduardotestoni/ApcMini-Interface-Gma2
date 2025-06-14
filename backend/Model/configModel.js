// model/configModel.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.join(__dirname, 'config.json');

export function readConfig() {
  try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf8');
    const config = JSON.parse(data);

    // Opcional: Adicionar valores padrão se alguma propriedade principal estiver faltando
    // Isso ajuda a lidar com arquivos config.json antigos ou incompletos
    config.credentials = config.credentials || {};
    config.controls = config.controls || {};
    config.controls.buttons = config.controls.buttons || [];
    config.controls.faders = config.controls.faders || [];
    config.controls.knobs = config.controls.knobs || []; // Garante que knobs é um array

    return config;

  } catch (error) {
    console.error("Erro ao ler config.json:", error.message);

    // Retorna a estrutura padrão completa se o arquivo não existir ou for inválido
    return {
      credentials: {},
      controls: {
        buttons: [],
        faders: [],
        knobs: [] 
      }
    };
  }
}

export function writeConfig(data) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Erro ao escrever config.json:", error.message);
    throw new Error(`Falha ao salvar a configuração: ${error.message}`);
  }
}