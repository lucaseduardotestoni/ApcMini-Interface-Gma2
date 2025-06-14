import fs from 'fs';
import easymidi from 'easymidi';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ApcMiniController {
    // Caminho para o arquivo de configuração
    constructor(configPath = path.join(__dirname, '../Model/config.json')) {
        this.configPath = configPath;
        this.mapping = {
            buttons: [],  
            faders: [],
            knobs: [],
        };
        this.deviceName = 'APC MINI';
        this.output = null; // será definido após conexão MIDI
        this.pressCounts = {}; // Armazena a contagem de pressionamentos por nota
    }

    carregarBanco() {
        try {
            this.limparLed(); // Limpa os LEDs antes de carregar o banco
            const data = fs.readFileSync(this.configPath, 'utf8');
            const json = JSON.parse(data);

            this.mapping.buttons = json.controls?.buttons || [];
            this.mapping.faders = json.controls?.faders || [];

            console.log('Banco de dados carregado com sucesso.');

            // Seta as cores dos botões conforme o banco
            if (this.output) {
                this.mapping.buttons.forEach(btn => {
                    // Usa btn.color ou um fallback se não existir
                    this.setLed(btn.notation, btn.color ?? 1);
                });
            } else {
                console.warn('Dispositivo MIDI não conectado. Não foi possível setar os LEDs.');
            }
        } catch (err) {
            console.error('Erro ao carregar config.json:', err.message);
        }
    }

    setLed(notation, color = 1) {
        if (!this.output) {
            throw new Error('Dispositivo MIDI não conectado.');
        }

        this.output.send('noteon', {
            note: notation,
            velocity: color,
            channel: 0
        });
    }

    // Exemplo de função para conectar a um dispositivo
    conectarDispositivoMidi() {
        if (
            easymidi.getOutputs().includes(this.deviceName) &&
            easymidi.getInputs().includes(this.deviceName)
        ) {
            this.output = new easymidi.Output(this.deviceName);
            this.input = new easymidi.Input(this.deviceName);

            console.log(`Conectado ao dispositivo: ${this.deviceName}`);

            // Eventos de Nota
            this.input.on('noteon', (msg) => {
                this.onNote(msg.note, msg.velocity, 'on');
            });

            this.input.on('noteoff', (msg) => {
                this.onNote(msg.note, msg.velocity, 'off');
            });

            // Evento de Control Change (Fader/Knob)
            this.input.on('cc', (msg) => {
                this.onFader(msg.controller, msg.value);
            });
        } else {
            throw new Error(`Dispositivo MIDI "${this.deviceName}" não encontrado nos inputs ou outputs.`);
        }
    }

    // Callback para eventos de nota
    onNote(note, velocity, type) {
        // Substitua este método ao instanciar para customizar o comportamento
        //console.log(`Nota: ${note}, Velocidade: ${velocity}, Tipo: ${type}`);
    }
        onFader(controller, value) {
        // Substitua este método ao instanciar ou modifique aqui
        //console.log(`Controlador (Fader/Knob): ${controller}, Valor: ${value}`);

        // EXEMPLO: Como agir para um fader específico
        const FADER_DE_VOLUME = 7; // Suponha que o ID do seu fader de volume é 7
        if (controller === FADER_DE_VOLUME) {
            const volumePercent = Math.round((value / 127) * 100);
            console.log(`--- Fader de Volume principal está em ${volumePercent}% ---`);
            // Aqui você faria algo com o valor, como ajustar o volume de um áudio.
        }
    }

    handleMidiMessage(type, note, velocity) {
        // Chama o callback sempre que uma nota for acionada
        this.onNote(note, velocity, type);

        if (type === 'noteon' && note >= 0 && note <= 63) {
            this.pressCounts[note] = (this.pressCounts[note] || 0) + 1;
            if (this.pressCounts[note] === 1) {
                const btn = this.mapping.buttons.find(b => b.notation === note);
                let cor = 0;
                if (btn && btn.color) {
                    if (btn.color === 1) cor = 2;
                    else if (btn.color === 3) cor = 4;
                    else if (btn.color === 5) cor = 6;
                    else cor = btn.color;
                }
                this.setLed(note, cor);
            } else if (this.pressCounts[note] === 2) {
                const btn = this.mapping.buttons.find(b => b.notation === note);
                let corBanco = btn && btn.color ? btn.color : 1;
                this.setLed(note, corBanco);
                this.pressCounts[note] = 0;
            }
        } else if (type === 'noteon' && note >= 64 && note <= 71) {
            this.pressCounts[note] = (this.pressCounts[note] || 0) + 1;
            if (this.pressCounts[note] === 1) {
                this.setLed(note, 2);
            } else if (this.pressCounts[note] === 2) {
                this.setLed(note, 1); // Cor padrão
                this.pressCounts[note] = 0; // Reseta o contador após a segunda pressão
            }
        } else if (type === 'noteoff') {
            // Opcional: pode zerar o contador aqui se quiser resetar ao soltar
            // this.pressCounts[note] = 0;
        }
        
    }
    limparLed() {
    if (!this.output) {
        console.warn('Output MIDI não está conectado.');
        return;
    }
    for (let note = 0; note <= 98; note++) {
        // Ignora os faders (notas de 48 a 56)
        if (note >= 48 && note <= 56) continue;
        this.setLed(note, 0); // Corrigido: use this.setLed
    }
}
}

// Exporta a classe para uso em outros módulos
export default ApcMiniController;
