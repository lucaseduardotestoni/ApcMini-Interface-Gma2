// index.js

import MidiService from './MidiService.js';
import faderService from './faderService.js';
import maService from './maService.js';

const controller = new MidiService();
const maController = maService.getMaController();

// Sessão iniciada
maController.on('session', (session) => {
  console.log("✅ Sessão iniciada:", session);
});

controller.onFader = async (cc, value) => {

  if (!faderService.shouldSendFader(cc, value)) return;
   
  const faderMapeado = controller.mapping.faders.find(f => Number(f.notation) === cc);
  if (!faderMapeado) {
    console.warn(`[FADER DEBUG] Fader ${cc} não mapeado.`);
    return;
  }

  const mappedValue = faderService.mapFaderValue(value);
  if (maController.session <= 0) return;

  try {
    if (cc === 56) {
      faderService.memorizeFaderValue(cc, mappedValue);
      let cmdValue = mappedValue * (maController.wing === 2 ? 225 : 100);
      const cmd = maController.wing === 2
        ? `SpecialMaster 3.1 At ${cmdValue}`
        : `SpecialMaster 2.1 At ${cmdValue}`;
      maController.sendCommand(cmd);
      console.log(`[FADER DEBUG] Master Fader CC ${cc} -> ${cmd}`);
    } else {
      maController.sendFader(faderMapeado.executor, faderMapeado.page, mappedValue);
      console.log(`[FADER DEBUG] Fader ${cc} -> Exec: ${faderMapeado.executor}, Page: ${faderMapeado.page}, Value: ${mappedValue}`);
    }
  } catch (err) {
    console.error(`[FADER DEBUG] Erro CC ${cc}:`, err.message);
  }
};

controller.onNote = async (note, velocity, type) => {
  const botaoMapeado = controller.mapping.buttons.find(b => Number(b.notation) === note);
  if (!botaoMapeado) {
    console.warn(`Botão não mapeado para nota ${note}`);
    return;
  }

  if (maController.session <= 0) await maService.esperarSessao();

  if (type === 'on') controller.handleMidiMessage('noteon', note, velocity);
  if (type === 'off') controller.handleMidiMessage('noteoff', note, velocity);

  try {
    switch (String(botaoMapeado.type)) {
      case '2': // Flash
        maController.sendCommand(`${type === 'on' ? 'Flash' : 'Flash Off'} Executor ${botaoMapeado.page}.${botaoMapeado.executor}`);
        break;
      case '3': // Toggle
        if (type === 'on') {
          maController.sendCommand(`Toggle Executor ${botaoMapeado.page}.${botaoMapeado.executor}`);
        }
        break;
      default: // Go
        if (type === 'on') {
          maController.sendCommand(`Go Executor ${botaoMapeado.page}.${botaoMapeado.executor}`);
        }
        break;
    }
  } catch (err) {
    console.error('Erro ao enviar comando:', err.message);
  }
};

// Inicialização
(async () => {
  try {
    await controller.conectarDispositivoMidi();
    controller.limparLed();
    await controller.carregarBanco();
  } catch (err) {
    console.error('Erro ao inicializar controlador MIDI:', err.message);
  }
})();
