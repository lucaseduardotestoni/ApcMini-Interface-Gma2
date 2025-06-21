// services/maService.js

import MaServiceWeb from './MaServiceWeb.js';

const maController = new MaServiceWeb({
  websocketURL: 'ws://localhost:80/',
  wing: 1,
  testMode: false
});

const esperarSessao = async () => {
  if (maController.session <= 0) {
    return new Promise(resolve => {
      const onSession = (session) => {
        if (session > 0) {
          maController.off('session', onSession);
          resolve();
        }
      };
      maController.on('session', onSession);
    });
  }
};

const getMaController = () => maController;

export default {
  getMaController,
  esperarSessao
};
