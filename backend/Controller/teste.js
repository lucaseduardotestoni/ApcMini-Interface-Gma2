import MidiController from './MidiController.js';
import MaControllerSocket from './MaControllerSocket.js';

const maController = new MaControllerSocket();
const controller = new MidiController();
let botaoMapeado = null;

controller.onFader = (controllerNumber, value) => {
  console.log('--- Movimento de Fader ---');
  console.log(`Controller: ${controllerNumber}`); // Número do fader (CC)
  console.log(`Valor: ${value}`);                // De 0 a 127
  console.log('---------------------------\n');
};
controller.onNote = async (note, velocity, type) => {
  botaoMapeado = controller.mapping.buttons.find(b => Number(b.notation) === Number(note));

  if (!botaoMapeado) {
    console.warn(`Botão não mapeado para a nota ${note}`);
    return;
  }


  // console.log('--- Nota MIDI Recebida ---');
  // console.log(`Tipo de evento: ${type}`);
  // console.log(`Número da Nota: ${note}`);
  // console.log(`Velocity (Força): ${velocity}`);
  // console.log(`Tipo do botão: ${botaoMapeado.type}`);
  // console.log('--------------------------\n');

  try {
    switch (botaoMapeado.type) {
      case '1': // Flash
        if (type === 'on') {
          controller.handleMidiMessage('noteon', note, velocity);
          maController.sendCommand(({
            action: "Flash",
            object: "Executor",
            page: botaoMapeado.page,
            id: botaoMapeado.executor
          }));
        } else if (type === 'off') {
          controller.handleMidiMessage('noteoff', note, velocity);
          maController.sendCommand(({
            action: "Flash Off",
            object: "Executor",
            page: botaoMapeado.page,
            id: botaoMapeado.executor
          }));
        }
        break;

      case '2': // Toggle
        if (type === 'on') {
          controller.handleMidiMessage('noteon', note, velocity);
          maController.sendCommand(({
            action: "Toggle",
            object: "Executor",
            page: botaoMapeado.page,
            id: botaoMapeado.executor
          }));
        }
        break;

      default: // Go
        if (type === 'on') {
          controller.handleMidiMessage('noteon', note, velocity);
          maController.sendCommand(({
            action: "Go",
            object: "Executor",
            page: botaoMapeado.page,
            id: botaoMapeado.executor
          }));
        }
        break;
    }

  } catch (e) {
    console.error('Erro ao enviar comando:', e.message);
  }
};

// Carregamento inicial
(async () => {
  try {
    controller.conectarDispositivoMidi();
    await controller.carregarBanco();
    maController.connect();
  } catch (error) {
    console.error('Erro ao inicializar controlador:', error.message);
  }
})();
