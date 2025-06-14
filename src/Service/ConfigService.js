const API_URL = 'http://localhost:3001';

// src/Service/configService.js
export default class ConfigService {
  static async getConfig() {
    const res = await fetch(API_URL+'/api/config');
    if (!res.ok) throw new Error('Erro ao carregar configurações');
    return await res.json();
  }

  static async saveButtonConfig(botaoAlterado) {
  // 1) Busca todos os botões atuais
  const config = await ConfigService.getButtons();
  let buttons = Array.isArray(config) ? [...config] : [];

  // 2) Atualiza ou adiciona o botão alterado
  const idx = buttons.findIndex(btn => btn.notation === botaoAlterado.notation);
  if (idx !== -1) {
    buttons[idx] = botaoAlterado;
  } else {
    buttons.push(botaoAlterado);
  }
  console.log('Botões atualizados:', buttons);

  // 🔍 Log antes da requisição
  const payload = { buttons };
  console.log('🔍 Enviando POST /api/buttons com payload:', JSON.stringify(payload, null, 2));

  // 3) Envia o array completo para o backend
  const res = await fetch(API_URL + '/api/buttons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  // 4) Debug da resposta
  const json = await res.json();
  console.log('Resposta do backend:', json);
  console.log('Status da resposta:', res.ok, res.status, res.statusText);

  if (!res.ok) {
    throw new Error(`Erro ao salvar botões: ${json.message || res.statusText}`);
  }

  return json;
}


  static async getButton(notation) {
    const res = await fetch(API_URL+`/api/button/${notation}`);
    console.log('Carregando botão:', res.ok);
    if (!res.ok) throw new Error('Erro ao carregar botão');
    return await res.json();
  }
  //Carrega todos os botões
    static async getButtons() {
    const res = await fetch(API_URL+'/api/buttons');
    if (!res.ok) throw new Error('Erro ao carregar botões');
    return await res.json();
  }

  static async saveFaderConfig(faderAlterado) {
    // 1) Busca todos os faders atuais
    const config = await ConfigService.getFaders();
    let faders = Array.isArray(config) ? [...config] : [];

    // 2) Atualiza ou adiciona o fader alterado
    const idx = faders.findIndex(f => f.notation === faderAlterado.notation);
    if (idx !== -1) {
      faders[idx] = faderAlterado;
    } else {
      faders.push(faderAlterado);
    }
    // 3) Envia o array completo para o backend
    const res = await fetch(API_URL+'/api/faders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faders })
    });
    const json = await res.json();
    if (!res.ok) throw new Error('Erro ao salvar faders');
    return json;
  }

    static async getFader(notation) {
    const res = await fetch(API_URL+`/api/fader/${notation}`);
    if (!res.ok) throw new Error('Erro ao carregar botão');
    return await res.json();
  }

  static async getFaders() {
    const res = await fetch(API_URL+'/api/faders');
    if (!res.ok) throw new Error('Erro ao carregar faders');
    return await res.json();
  }

  static async getKnobs() {
    const res = await fetch(API_URL+'/api/knobs');
    if (!res.ok) throw new Error('Erro ao carregar knobs');
    return await res.json();
  }
  static async saveKnobConfig(knobAlterado) {
    // 1) Busca todos os knobs atuais
    const config = await ConfigService.getKnobs();
    let knobs = Array.isArray(config) ? [...config] : [];

    // 2) Atualiza ou adiciona o knob alterado
    const idx = knobs.findIndex(k => k.notation === knobAlterado.notation);
    if (idx !== -1) {
      knobs[idx] = knobAlterado;
    } else {
      knobs.push(knobAlterado);
    }

    // 3) Envia o array completo para o backend
    const res = await fetch(API_URL+'/api/knobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ knobs })
    });
    const json = await res.json();
    if (!res.ok) throw new Error('Erro ao salvar knobs');
    return json;
  }

  static async getKnob(notation) {
    const res = await fetch(API_URL+`/api/knob/${notation}`);
    if (!res.ok) throw new Error('Erro ao carregar knob');
    return await res.json();
  }
}
