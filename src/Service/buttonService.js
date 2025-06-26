const API_URL = 'http://localhost:3001';

export default class ButtonService {
  static async getButtons() {
    const res = await fetch(API_URL + '/api/buttons');
    if (!res.ok) throw new Error('Erro ao carregar botões');
    return await res.json();
  }

  static async getButton(notation) {
    const res = await fetch(API_URL + `/api/button/${notation}`);
    if (!res.ok) throw new Error('Erro ao carregar botão');
    return await res.json();
  }

  static async saveButtonConfig(botaoAlterado) {
    const config = await ButtonService.getButtons();
    let buttons = Array.isArray(config) ? [...config] : [];
    const idx = buttons.findIndex(btn => btn.notation === botaoAlterado.notation);
    if (idx !== -1) {
      buttons[idx] = botaoAlterado;
    } else {
      buttons.push(botaoAlterado);
    }
    const res = await fetch(API_URL + '/api/buttons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buttons })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(`Erro ao salvar botões: ${json.message || res.statusText}`);
    return json;
  }
}