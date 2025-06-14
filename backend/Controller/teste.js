// index.js

import MidiController from './MidiController.js';
import MaControllerWeb from './MaControllerWeb.js';

// --- Variáveis Globais e Configurações (manter, se necessário) ---
// O array faderValue precisa estar disponível globalmente ou ser importado
// se você não o tiver em MidiController.js ou MaControllerWeb.js.
// Eu o incluí aqui para que o exemplo seja completo.

const faderValue = [0, 0, 0, 0, 0.002, 0.006, 0.01, 0.014, 0.018, 0.022, 0.026, 0.03, 0.034, 0.038, 0.042, 0.046, 0.05, 0.053, 0.057, 0.061, 0.065, 0.069, 0.073, 0.077, 0.081, 0.085, 0.089, 0.093, 0.097, 0.1, 0.104, 0.108, 0.112, 0.116, 0.12, 0.124, 0.128, 0.132, 0.136, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.2, 0.21, 0.22, 0.23, 0.24, 0.25, 0.26, 0.27, 0.28, 0.29, 0.3, 0.31, 0.32, 0.33, 0.34, 0.35, 0.36, 0.37, 0.38, 0.39, 0.4, 0.41, 0.42, 0.43, 0.44, 0.45, 0.46, 0.47, 0.48, 0.49, 0.5, 0.51, 0.52, 0.53, 0.54, 0.55, 0.56, 0.57, 0.58, 0.59, 0.6, 0.61, 0.62, 0.63, 0.64, 0.65, 0.66, 0.67, 0.68, 0.69, 0.7, 0.71, 0.72, 0.73, 0.74, 0.75, 0.76, 0.77, 0.78, 0.79, 0.8, 0.81, 0.82, 0.83, 0.84, 0.85, 0.86, 0.87, 0.88, 0.89, 0.9, 0.91, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 1, 1, 1];

const controller = new MidiController();
let botaoMapeado = null;
let faderMapeado = null; // Mantenha esta variável para armazenar o mapeamento do fader

// Adicionar faderTime e faderValueMem para controlar o spam de CC
const NS_PER_SEC = 1e9;
const faderTime = Array(128).fill(process.hrtime());
const faderValueMem = Array(128).fill(0); // Para o master fader, se você precisar memorizar o valor

const maController = new MaControllerWeb({
  websocketURL: 'ws://localhost:80/', // ou a URL do seu servidor WebSocket
  wing: 1,                             // ou 2, 3 etc., conforme sua configuração
  testMode: false                      // true se quiser simular sem conexão real
});

maController.on('session', (session) => {
  console.log("✅ Sessão iniciada:", session);
  // Você pode querer inicializar os LEDs do APC Mini aqui, se MaControllerWeb não fizer isso.
  // controller.limparLed(); // Chame aqui se for o caso
});

controller.onFader = async (controllerNumber, value) => {
  // Adiciona o filtro de tempo para evitar spam de mensagens do fader
  const now = process.hrtime();
  const diff = process.hrtime(faderTime[controllerNumber]);
  const diffNs = diff[0] * NS_PER_SEC + diff[1];

  // Limiar de 50ms ou valores extremos (0 e 127) para garantir responsividade
  if (diffNs >= 50000000 || value === 0 || value === 127) {
    faderTime[controllerNumber] = now; // Atualiza o timestamp para este fader

    // Encontre o mapeamento do fader
    faderMapeado = controller.mapping.faders.find(f => Number(f.notation) === Number(controllerNumber));

    if (!faderMapeado) {
      console.warn(`[FADER DEBUG] Fader MIDI CC ${controllerNumber} não mapeado no seu arquivo de mapeamento.`);
      return;
    }

    // Mapeia o valor MIDI (0-127) para a escala 0-1
    const mappedValue = faderValue[value];

    // --- ADICIONE ESTES CONSOLE.LOGS AQUI ---
    console.log(`\n[FADER DEBUG] Fader MIDI CC: ${controllerNumber}, MIDI Value: ${value}, Mapped Value (0-1): ${mappedValue}`);
    console.log(`[FADER DEBUG] Mapeamento encontrado: Executor: ${faderMapeado.executor}, Page: ${faderMapeado.page}`);
    console.log(`[FADER DEBUG] Sessão MAControllerWeb: ${maController.session}`);
    // --- FIM DOS CONSOLE.LOGS ---

    // Certifique-se de que a sessão com a grandMA2 está ativa antes de enviar comandos
    if (maController.session <= 0) {
      console.log("[FADER DEBUG] Aguardando sessão com grandMA2 para enviar fader...");
      return;
    }

    try {
      // Lógica para o Master Fader (CC 56 no APC Mini)
      if (controllerNumber === 56) {
        faderValueMem[controllerNumber] = mappedValue;
        let cmdValue = mappedValue * 100; // Ou 225 para wing 2
        if (maController.wing === 1 || maController.wing === 3) {
          maController.sendCommand(`SpecialMaster 2.1 At ${cmdValue}`);
        } else if (maController.wing === 2) {
          cmdValue = mappedValue * 225; // Reajusta a escala para wing 2
          maController.sendCommand(`SpecialMaster 3.1 At ${cmdValue}`);
        }
        console.log(`[FADER DEBUG] ENVIANDO: Master Fader (CC ${controllerNumber}) para SpecialMaster no valor ${cmdValue}`);

      } else { // Outros Faders de Execução (CC 48-55 no APC Mini)
        // Usando a página FIXA do config.json, como você confirmou
        maController.sendFader(faderMapeado.executor, faderMapeado.page, mappedValue);
        console.log(`[FADER DEBUG] ENVIANDO: Fader (CC ${controllerNumber}) -> Exec: ${faderMapeado.executor}, Page: ${faderMapeado.page}, Value: ${mappedValue}`);
      }
    } catch (error) {
      console.error(`[FADER DEBUG] ERRO ao processar o fader ${controllerNumber}:`, error.message);
    }
  }
};

// --- O restante do seu código (controller.onNote, inicialização) permanece o mesmo ---

controller.onNote = async (note, velocity, type) => {
  // ... (seu código onNote atual) ...
  botaoMapeado = controller.mapping.buttons.find(b => Number(b.notation) === Number(note));

  if (!botaoMapeado) {
    console.warn(`Botão não mapeado para a nota ${note}`);
    return;
  }

  // Função auxiliar para aguardar a sessão (se necessário, defina-a fora desta função)
  const esperarSessao = async (maCtrl) => {
    if (maCtrl.session <= 0) {
      return new Promise(resolve => {
        const onSessionReady = (session) => {
          if (session > 0) {
            maCtrl.off('session', onSessionReady); // Remove o listener
            resolve();
          }
        };
        maCtrl.on('session', onSessionReady);
      });
    }
  };


  if (maController.session <= 0) await esperarSessao(maController);
  try {
    if (type == 'on') {
      //  console.log('--- Nota MIDI Recebida ---');
      //  console.log(`Tipo de evento: ${type}`);
      //console.log(`Número da Nota: ${note}`);
      //  console.log(`Velocity (Força): ${velocity}`);
      //console.log(`Tipo do botão: ${botaoMapeado.type}`);
      //  console.log('--------------------------\n');
    }
  } catch (error) {
    console.error('Erro geral no onNote:', error.message);
  }


  if (maController.session <= 0) await esperarSessao(maController);
  try {
    switch (String(botaoMapeado.type)) {
      case '2': // Flash
        if (type === 'on') {
          controller.handleMidiMessage('noteon', note, velocity); // Se esta linha for para feedback LED local
          maController.sendCommand(`Flash Executor ${botaoMapeado.page}.${botaoMapeado.executor}`);
        } else if (type === 'off') {
          controller.handleMidiMessage('noteoff', note, velocity); // Se esta linha for para feedback LED local
          maController.sendCommand(`Flash Off Executor ${botaoMapeado.page}.${botaoMapeado.executor}`);
        }
        break;

      case '3': // Toggle
        if (type === 'on') {
          console.log('--- Enviando Toggle ---');
          controller.handleMidiMessage('noteon', note, velocity); // Se esta linha for para feedback LED local
          maController.sendCommand(`Toggle Executor ${botaoMapeado.page}.${botaoMapeado.executor}`);
        }
        break;

      default: // Go (botão padrão)
        if (type === 'on') {
          controller.handleMidiMessage('noteon', note, velocity); // Se esta linha for para feedback LED local
          maController.sendCommand(`Go Executor ${botaoMapeado.page}.${botaoMapeado.executor}`);
        }
        break;
    }

  } catch (e) {
    console.error('Erro ao enviar comando:', e.message);
  }
};

// Carregamento inicial
(async () => {
  try {
    await controller.conectarDispositivoMidi();
    // Assume que `controller.limparLed()` envia comandos MIDI para o APC Mini
    // e não precisa da sessão MA.
    controller.limparLed();
    await controller.carregarBanco();
    // MaControllerWeb.connectWebSocket() é chamado no construtor,
    // então a conexão é iniciada automaticamente.
  } catch (error) {
    console.error('Erro ao inicializar controlador:', error.message);
  }
})();