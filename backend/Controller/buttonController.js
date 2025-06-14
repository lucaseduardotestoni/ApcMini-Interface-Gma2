// controller/buttonController.js
import express from 'express';
import { readConfig, writeConfig } from '../Model/configModel.js';
import { ButtonValidator } from '../Util/ButtonValidator.js';

const router = express.Router();

router.post('/api/buttons', (req, res) => {
  const { buttons } = req.body;
  console.log('POST /api/buttons', buttons);
  if (!Array.isArray(buttons)) {
    console.log('Formato inválido para buttons:', buttons);
    console.log('Esperado um array, mas recebido:', typeof buttons);
    return res.status(400).json({ message: 'Formato inválido para buttons' });
  }

  const current = readConfig();
  const sanitizedButtons = [];

  for (const btn of buttons) {
    const { isValid, sanitized, errors } = ButtonValidator.validate(btn);

    if (!isValid) {
      return res.status(400).json({ message: `Erro ao validar botão notation=${btn.notation}`, errors });
    }

    const idx = current.controls.buttons.findIndex(b => b.notation === btn.notation);
    if (idx !== -1) current.controls.buttons[idx] = sanitized;
    else current.controls.buttons.push(sanitized);

    sanitizedButtons.push(sanitized);
  }

  writeConfig(current);
  res.json({ message: 'Botões salvos com sucesso!', saved: sanitizedButtons });
});


router.get('/api/button/:notation', (req, res) => {
  const notation = parseInt(req.params.notation, 10);
  if (isNaN(notation)) {
    return res.status(400).json({ message: 'Notation inválido' });
  }
  const current = readConfig();
  const button = Array.isArray(current?.controls?.buttons)
    ? current.controls.buttons.find(b => b.notation === notation)
    : undefined;
  if (!button) {
    // Retorna um objeto padrão ao invés de 404
    return res.json({
      notation,
      colorName: 'Off',
      type: 1,
      executor: '101',
      page: 1
    });
  }
  res.json(button);
});
router.get('/api/buttons', (req, res) => {
  const current = readConfig();
  const buttons = Array.isArray(current?.controls?.buttons)
    ? current.controls.buttons
    : [];
  res.json(buttons);
});

export default router;
