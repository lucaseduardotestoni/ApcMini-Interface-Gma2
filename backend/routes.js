// routes.js
import buttonController from './Controller/buttonController.js';
import faderController from './Controller/faderController.js';
import configController from './Controller/configController.js';
import knoberController from './Controller/knobController.js';
import ApcMiniController from './Controller/apcMiniController.js';
import MaController from './Controller/maController.js';

export default function registerRoutes(app) {
  app.use(buttonController);
  app.use(faderController);
  app.use(configController);
  app.use(knoberController);
  app.use(ApcMiniController)
  app.use(MaController)
}
