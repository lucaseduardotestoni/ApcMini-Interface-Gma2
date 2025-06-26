const API_URL = 'http://localhost:3001';

export default class FaderService {
  static async getFaders() {
    const res = await fetch(API_URL + '/api/faders');
    if (!res.ok) throw new Error('Erro ao carregar faders');
    return await res.json();
  }

  static async getFader(notation) {
    const res = await fetch(API_URL + `/api/fader/${notation}`);
    if (!res.ok) throw new Error('Erro ao carregar fader');
    return await res.json();
  }

  static async saveFaderConfig(faderAlterado) {
    const config = await FaderService.getFaders();
    let faders = Array.isArray(config) ? [...config] : [];
    const idx = faders.findIndex(f => f.notation === faderAlterado.notation);
    if (idx !== -1) {
      faders[idx] = faderAlterado;
    } else {
      faders.push(faderAlterado);
    }
    const res = await fetch(API_URL + '/api/faders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faders })
    });
    const json = await res.json();
    if (!res.ok) throw new Error('Erro ao salvar faders');
    return json;
  }
}