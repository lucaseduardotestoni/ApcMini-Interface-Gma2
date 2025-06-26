import EventEmitter from 'events';
import pkg from 'websocket';
const { w3cwebsocket } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '../Model/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

class MaController extends EventEmitter {
  constructor({ websocketURL = 'ws://localhost:80/', wing = 1, testMode = false } = {}) {
    // 🔧 Singleton - retorna a instância existente se já existe
    if (MaController.instance) {
      console.log("♻️ Reutilizando instância existente do MaController");
      return MaController.instance;
    }

    super();
    MaController.instance = this;
    
    this.websocketURL = websocketURL;
    this.wing = wing;
    this.testMode = testMode;
    this.shouldReconnect = true;

    this.session = 0;
    this.blackout = 0;
    this.ledMatrix = Array(90).fill(0);
    this.pageIndex = 0;
    this.pageIndex2 = 0;

    this.playbackInterval = null;
    this.pingInterval = null;
    this.reconnectTimeout = null;

    this.connectWebSocket();
    this.startIntervals();

    console.log("🆕 Nova instância do MaController criada");
  }

  static getInstance(options = {}) {
    if (!MaController.instance) {
      new MaController(options);
    }
    return MaController.instance;
  }

  static resetInstance() {
    if (MaController.instance) {
      MaController.instance.close();
      MaController.instance = null;
    }
  }

  startIntervals() {
    this.clearIntervals();

    this.playbackInterval = setInterval(() => this.requestPlaybackUpdates(), 10000);
    
    this.pingInterval = setInterval(() => {
      if (this.session > 0 && this.client?.readyState === 1) {
        this.client.send(JSON.stringify({ session: this.session }));
      }
    }, 10000);
  }

  clearIntervals() {
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  connectWebSocket() {
    if (this.client?.readyState === 1) {
      console.log("🔌 WebSocket já está conectado");
      return;
    }

    this.client = new w3cwebsocket(this.websocketURL);

    this.client.onopen = () => {
      console.log("🔌 WebSocket conectado");
      this.emit('connected');
      this.client.send(JSON.stringify({ session: 0 }));
    };

    this.client.onclose = () => {
      console.log("❌ WebSocket desconectado");
      this.emit('disconnected');

      if (this.shouldReconnect) {
        this.reconnectTimeout = setTimeout(() => {
          console.log("🔁 Reconectando WebSocket...");
          this.connectWebSocket();
        }, 3000);
      } else {
        console.log("🚫 Reconexão automática desabilitada.");
      }
    };

    this.client.onerror = err => {
      console.error("⚠️ Erro WebSocket:", err.message);
    };

    this.client.onmessage = e => {
      if (typeof e.data === 'string') {
        const message = JSON.parse(e.data);
        this.handleWSMessage(message);
      }
    };
  }

  sendWS(data) {
    if (this.client && this.client.readyState === 1) {
      console.log("[DEBUG] Enviando WS:", data);
      this.client.send(JSON.stringify(data));
    } else {
      console.warn("🚫 WebSocket não está conectado (readyState:", this.client?.readyState, "). Dados:", data);
    }
  }

  sendPlaybackButton(execIndex, pageIndex, buttonId, pressed = true) {
    this.sendWS({
      requestType: "playbacks_userInput",
      cmdline: "",
      execIndex,
      pageIndex,
      buttonId,
      pressed,
      released: !pressed,
      type: 0,
      session: this.session,
      maxRequests: 0,
    });
  }

  sendFader(execIndex, pageIndex, value) {
    if (this.session <= 0) {
      console.warn("[FADER] Sessão inválida. Fader não enviado.");
      return;
    }

    this.sendWS({
      requestType: "playbacks_userInput",
      execIndex,
      pageIndex,
      faderValue: value,
      type: 1,
      session: this.session,
      maxRequests: 0,
    });
  }

  sendCommand(cmd) {
    if (this.session <= 0) {
      console.warn("[COMMAND] Sessão inválida. Comando não enviado:", cmd);
      return;
    }

    this.sendWS({
      command: cmd,
      requestType: "command",
      session: this.session,
      maxRequests: 0,
    });
  }

  requestPlaybackUpdates() {
    if (this.session > 0 && this.client?.readyState === 1) {
      this.sendWS({
        requestType: 'playbacks',
        startIndex: [100],
        itemsCount: [90],
        pageIndex: this.pageIndex,
        itemsType: [3],
        view: 3,
        execButtonViewMode: 2,
        buttonsViewMode: 0,
        session: this.session,
        maxRequests: 1
      });

      this.sendWS({
        requestType: 'playbacks',
        startIndex: [0],
        itemsCount: [10],
        pageIndex: this.pageIndex2,
        itemsType: [2],
        view: 2,
        execButtonViewMode: 1,
        buttonsViewMode: 0,
        session: this.session,
        maxRequests: 1
      });
    }
  }

  isMAConnected() {
    if (!this.client) {
      console.warn("Cliente WebSocket não inicializado.");
      return { connected: false, session: null };
    }

    const conectado = this.client.readyState === 1;
    const sessaoValida = this.session && this.session > 0;

    if (conectado && sessaoValida) {
      return { connected: true, session: this.session };
    } else {
      return { connected: false, session: null };
    }
  }

  close() {
    console.log("🔌 Fechando conexão manualmente...");
    this.shouldReconnect = false; // 🔧 Impede reconexão automática

    this.clearIntervals();

    if (this.client?.readyState === 1) {
      // 1. Enviar requisição de fechamento
      this.client.send(JSON.stringify({
        requestType: "close",
        session: this.session,
        maxRequests: 1
      }));

      // 2. Finalizar sessão interna
      this.session = 0;

      // 3. Fechar WebSocket
      this.client.close();

      console.log("🔚 Conexão com a MA encerrada.");
    } else {
      console.warn("🚫 WebSocket já estava desconectado.");
    }

    this.removeAllListeners();
    
    // 🔧 Remove a instância singleton
    MaController.instance = null;
  }

  // 🔧 Método para permitir reconexão novamente (se necessário)
  enableReconnection() {
    this.shouldReconnect = true;
    console.log("✅ Reconexão automática habilitada.");
  }

  // 🔧 Método para reconectar manualmente
  reconnect() {
    this.shouldReconnect = true;
    this.connectWebSocket();
  }

  handleWSMessage(msg) {
    if (msg.forceLogin === true && msg.session !== undefined) {
      this.session = msg.session;
      this.sendWS({
        requestType: 'login',
        username: config.credentials.username,
        password: config.credentials.password,
        session: this.session,
        maxRequests: 10
      });
    }

    if (msg.status === "server ready") {
      console.log("✅ SERVER READY");
    }

    if (msg.session !== undefined) {
      this.session = msg.session;
      this.emit('session', this.session);
      console.log("🔑 Sessão:", this.session);
    }

    if (msg.responseType === "login" && msg.result === true) {
      console.log("✅ Login efetuado");
    }

    if (msg.text) {
      console.log("🧾 Texto:", msg.text);
    }

    if (msg.responseType === "playbacks") {
      this.emit('ledUpdate', msg);
    }

    this.emit('message', msg);
  }
}

// 🔧 Inicializa como null
MaController.instance = null;

export default MaController;
