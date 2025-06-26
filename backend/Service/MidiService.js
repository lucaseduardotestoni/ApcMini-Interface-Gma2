import fs from 'fs';
import easymidi from 'easymidi';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MidiService {
  constructor(configPath = path.join(__dirname, '../Model/config.json')) {
    this.configPath = configPath;
    this.mapping = {
      buttons: [],
      faders: [],
      knobs: [],
    };
    this.deviceName = 'APC MINI';
    this.output = null;
    this.pressCounts = {}; // para controle de LED por clique
  }
   static isConnected(deviceName) {
    return easymidi.getOutputs().includes(deviceName) && easymidi.getInputs().includes(deviceName);
  }
  isConnected(deviceName) {
    return easymidi.getOutputs().includes(deviceName) && easymidi.getInputs().includes(deviceName);
  }

  async carregarBanco() {
    try {
      await this.limparLed();
      const data = fs.readFileSync(this.configPath, 'utf8');
      const json = JSON.parse(data);

      this.mapping.buttons = json.controls?.buttons || [];
      this.mapping.faders = json.controls?.faders || [];

      console.log('Banco de dados carregado com sucesso.');

      if (this.output) {
        this.mapping.buttons.forEach(btn => {
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

  conectarDispositivoMidi(intervalMs = 2000) {
    this.lastStatus = false;
    try {
      
    
    this._intervalId = setInterval(async () => {
      const connected = this.isConnected(this.deviceName);

      if (connected && !this.lastStatus) {
        console.log(`Conectado ao dispositivo: ${this.deviceName}`);

        // Feche conexões antigas, se existirem
        if (this.output) this.output.close();
        if (this.input) this.input.close();

        // Crie novas conexões
        this.output = new easymidi.Output(this.deviceName);
        this.input = new easymidi.Input(this.deviceName);

        // Adicione listeners
        this.input.on('noteon', (msg) => {
          this.onNote(msg.note, msg.velocity, 'on');
        });
        this.input.on('noteoff', (msg) => {
          this.onNote(msg.note, msg.velocity, 'off');
        });
        this.input.on('cc', (msg) => {
          this.onFader(msg.controller, msg.value);
        });

        await this.limparLed();
        await this.carregarBanco();

      } else if (!connected && this.lastStatus) {
        // Desconectou!
        console.log('APC MINI desconectada!');
        if (this.output) this.output.close();
        if (this.input) this.input.close();
        this.output = null;
        this.input = null;
      }

      this.lastStatus = connected;
    }, intervalMs);
    } catch (error) {
      console.error('Erro ao conectar dispositivo MIDI:', error.message);
    }
  }

onNote(note, velocity, type) {
  // Substituído pela lógica externa (em teste.js)
}

onFader(controller, value) {
  // Substituído pela lógica externa (em teste.js)
}

handleMidiMessage(type, note, velocity) {
  this.onNote(note, velocity, type);
  // Botões normais (0 a 63)
  if (type === 'noteon' && note >= 0 && note <= 63) {
    this.pressCounts[note] = (this.pressCounts[note] || 0) + 1;
    const btn = this.mapping.buttons.find(b => b.notation === note);

    if (this.pressCounts[note] === 1) {
      this.setLed(note,
        btn?.color === 1 ? 2 :
          btn?.color === 3 ? 4 :
            btn?.color === 5 ? 6 :
              btn?.color ?? 1
      );
    } else if (this.pressCounts[note] === 2) {
      this.setLed(note, btn?.color ?? 1);
      this.pressCounts[note] = 0;
    }

  } else if (type === 'noteon' && note >= 64 && note <= 71) {
    // Botões tipo "flash"
    this.pressCounts[note] = (this.pressCounts[note] || 0) + 1;

    if (this.pressCounts[note] === 1) {
      this.setLed(note, 2); // cor de flash pressionado
    } else if (this.pressCounts[note] === 2) {
      this.setLed(note, 1); // cor padrão
      this.pressCounts[note] = 0;
    }

  } else if (type === 'noteoff') {
    // Ao soltar o botão flash, volta para a cor padrão
    const btn = this.mapping.buttons.find(b => b.notation === note);
    if (btn) {
      this.setLed(note, btn.color ?? 1); // volta para a cor original
    }
  }
}


async limparLed() {
  if (!this.output) {
    console.warn('Output MIDI não está conectado.');
    return;
  }
  for (let note = 0; note <= 98; note++) {
    if (note >= 48 && note <= 56) continue;
    this.setLed(note, 0);
  }
}
}

export default MidiService;
