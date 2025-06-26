const API_URL = 'http://localhost:3001';

export default class KnobService {
  static async getKnobs() {
    const res = await fetch(API_URL + '/api/knobs');
    if (!res.ok) throw new Error('Erro ao carregar knobs');
    return await res.json();
  }

  static async getKnob(notation) {
    const res = await fetch(API_URL + `/api/knob/${notation}`);
    if (!res.ok) throw new Error('Erro ao carregar knob');
    return await res.json();
  }

  static async saveKnobConfig(knobAlterado) {
    const config = await KnobService.getKnobs();
    let knobs = Array.isArray(config) ? [...config] : [];
    const idx = knobs.findIndex(k => k.notation === knobAlterado.notation);
    if (idx !== -1) {
      knobs[idx] = knobAlterado;
    } else {
      knobs.push(knobAlterado);
    }
    const res = await fetch(API_URL + '/api/knobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ knobs })
    });
    const json = await res.json();
    if (!res.ok) throw new Error('Erro ao salvar knobs');
    return json;
  }
}