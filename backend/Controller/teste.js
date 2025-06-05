import ApcMiniController from './MidiController.js';

const controller = new ApcMiniController();

try {
  controller.conectarDispositivoMidi();
  controller.carregarBanco();

  // Por exemplo, acender o LED da nota 60 com fallback 1
  //controller.setLed(51, 5);

} catch (error) {
  console.error('Erro:', error.message);
}
