import MidiController from './MidiController.js';
import MaController from './MaController.js';

const controller = new MidiController();
const apcMini = new MaController({ websocketURL: 'ws://localhost:80/' }); // Isso já conecta

// Sobrescreve o método onNote para enviar comandos via WebSocket
controller.onNote = (note, velocity, type) => {
  if (type === 'on' && velocity > 0) {
    // Botão
    const btn = controller.mapping?.buttons?.find(b => Number(b.notation) === Number(note));
    if (btn) {
      controller.handleMidiMessage('noteon', note, velocity);
      apcMini.sendPlaybackButton(btn.executor, btn.page, btn.buttonId ?? 0, true);
      return;
    }
    // Fader (notas de 48 a 57)
    if (note >= 48 && note <= 57) {
      const fader = controller.mapping?.faders?.find(f => Number(f.notation) === Number(note));
      console.log('fader encontrado:', fader);
      const execIndex = fader?.executor ?? 0;
      const pageIndex = fader?.page ?? 0;
      const value = velocity / 127;
      apcMini.sendFader(execIndex, pageIndex, value);
      return;
    }
  }
  // Outros controles, se necessário
};

try {
  await controller.carregarBanco();           // 1º: Carrega o banco/mapeamento
  controller.conectarDispositivoMidi();       // 2º: Só então conecta o MIDI
} catch (error) {
  console.error('Erro:', error.message);
}
