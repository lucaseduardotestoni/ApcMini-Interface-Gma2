const API_URL = 'http://localhost:3001';

export default class ConfigService {
  static async getConfig() {
    const res = await fetch(API_URL + '/api/config');
    if (!res.ok) throw new Error('Erro ao carregar configurações');
    return await res.json();
  }

  static async saveConfig(config) {
    const res = await fetch(API_URL + '/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!res.ok) throw new Error('Erro ao salvar configurações');
    return await res.json();
  }
  // frontend/services/api.js ou similar

  static async getMidiStatus() {
    const res = await fetch(API_URL + '/api/statusMidi');

    if (!res.ok) throw new Error('Erro ao obter status do dispositivo MIDI');

    const data = await res.json();
    return data;
  }
  
  static async getMaStatus() {
    const res = await fetch(API_URL + '/api/maStatus');

    if (!res.ok) throw new Error('Erro ao obter status do MA');

    const data = await res.json();
    return data;
  }

}
