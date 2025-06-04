const API_URL = 'http://localhost:3001/api/config';

// src/Service/configService.js
export default class ConfigService {
  static async getConfig() {
    const res = await fetch('http://localhost:3001/api/config');
    if (!res.ok) throw new Error('Erro ao carregar configurações');
    return await res.json();
  }

  static async saveButtonConfig(botaoAlterado) {
    // 1) Busca todos os botões atuais
    const config = await ConfigService.getConfig();
    let buttons = Array.isArray(config?.controls?.buttons)
      ? [...config.controls.buttons]
      : [];

    // 2) Atualiza ou adiciona o botão alterado
    const idx = buttons.findIndex(btn => btn.notation === botaoAlterado.notation);
    if (idx !== -1) {
      buttons[idx] = botaoAlterado;
    } else {
      buttons.push(botaoAlterado);
    }
    console.log('Botões atualizados:', buttons);

    // 3) Envia o array completo para o backend
    const res = await fetch('http://localhost:3001/api/buttons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buttons })
    });
    const json = await res.json();
    console.log('Resposta do backend:', json);
    console.log('Status da resposta:', res.ok);
    if (!res.ok) throw new Error('Erro ao salvar botões');
    return json;
  }

  static async getButton(notation) {
    const res = await fetch(`http://localhost:3001/api/button/${notation}`);
    console.log('Carregando botão:', res.ok);
    if (!res.ok) throw new Error('Erro ao carregar botão');
    return await res.json();
  }

  static async saveFaderConfig(faderAlterado) {
    // 1) Busca todos os faders atuais
    const config = await ConfigService.getConfig();
    let faders = Array.isArray(config?.controls?.faders)
      ? [...config.controls.faders]
      : [];

    // 2) Atualiza ou adiciona o fader alterado
    const idx = faders.findIndex(f => f.notation === faderAlterado.notation);
    if (idx !== -1) {
      faders[idx] = faderAlterado;
    } else {
      faders.push(faderAlterado);
    }
    console.log('Faders atualizados:', faders);

    // 3) Envia o array completo para o backend
    const res = await fetch('http://localhost:3001/api/faders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faders })
    });
    const json = await res.json();
    console.log('Resposta do backend:', json);
    console.log('Status da resposta:', res.ok);
    if (!res.ok) throw new Error('Erro ao salvar faders');
    return json;
  }

    static async getFader(notation) {
    const res = await fetch(`http://localhost:3001/api/fader/${notation}`);
    console.log('Carregando botão:', res.ok);
    if (!res.ok) throw new Error('Erro ao carregar botão');
    return await res.json();
  }
}
