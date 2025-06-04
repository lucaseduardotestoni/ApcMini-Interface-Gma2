import fs from 'fs';
import easymidi from 'easymidi';
import path from 'path';
import { fileURLToPath } from 'url';   

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


class ApcMiniController {
    // Caminho para o arquivo de configuração
    constructor(configPath = path.join(__dirname, 'config.json')) {
        this.configPath = configPath;
        this.mapping = {
            buttons: [],
            faders: [],
        };
        this.deviceName = 'APC MINI';
        this.output = null; // será definido após conexão MIDI
    }

    carregarBanco() {
        try {
            const data = fs.readFileSync(this.configPath, 'utf8');
            const json = JSON.parse(data);

            this.mapping.buttons = json.controls?.buttons || [];
            this.mapping.faders = json.controls?.faders || [];

            console.log('Banco de dados carregado com sucesso.');
        } catch (err) {
            console.error('Erro ao carregar config.json:', err.message);
        }
    }

    setLed(notation, fallbackColor = 1) {
        if (!this.output) {
            throw new Error('Dispositivo MIDI não conectado.');
        }

        // Procura a configuração correspondente à nota
        const button = this.mapping.buttons.find(btn => btn.notation === notation);

        const colorValue = button ? button.color : fallbackColor;

        this.output.send('noteon', {
            note: notation,
            velocity: colorValue,
            channel: 0
        });
    }

    // Exemplo de função para conectar a um dispositivo
    conectarDispositivoMidi() {
        if (easymidi.getOutputs().includes(this.deviceName)) {
            this.output = new easymidi.Output(this.deviceName);
            console.log(`Conectado ao dispositivo: ${this.deviceName}`);
        } else {
            throw new Error(`Dispositivo MIDI "${this.deviceName}" não encontrado.`);
        }
    }
}

// Exporta a classe para uso em outros módulos
export default ApcMiniController;
