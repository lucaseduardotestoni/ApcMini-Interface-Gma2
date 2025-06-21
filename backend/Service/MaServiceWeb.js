import EventEmitter from 'events';
import pkg from 'websocket';
const { w3cwebsocket } = pkg;

class MaController extends EventEmitter {
  constructor({ websocketURL = 'ws://localhost:80/', wing = 1, testMode = false } = {}) {
    super();

    this.websocketURL = websocketURL;
    this.wing = wing;
    this.testMode = testMode;

    this.session = 0;
    this.blackout = 0;
    this.ledMatrix = Array(90).fill(0);
    this.pageIndex = 0;
    this.pageIndex2 = 0;

    this.connectWebSocket();

    setInterval(() => this.requestPlaybackUpdates(), 10000);

    // 🔄 Ping a cada 10 segundos para manter sessão viva
    setInterval(() => {
      if (this.session > 0 && this.client?.readyState === 1) {
        this.client.send(JSON.stringify({ session: this.session }));
        console.log("[PING] 🔄 Sessão ping enviada para manter ativa.");
      }
    }, 10000);
  }

  connectWebSocket() {
    this.client = new w3cwebsocket(this.websocketURL);

    this.client.onopen = () => {
      console.log("🔌 WebSocket conectado");
      this.emit('connected');
      this.client.send(JSON.stringify({ session: 0 }));
    };

    this.client.onclose = () => {
      console.log("❌ WebSocket desconectado");
      this.emit('disconnected');

      // 🔁 Tentativa de reconexão
      setTimeout(() => {
        console.log("🔁 Reconectando WebSocket...");
        this.connectWebSocket();
      }, 3000);
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

  handleWSMessage(msg) {
    if (msg.forceLogin === true && msg.session !== undefined) {
      this.session = msg.session;
      this.sendWS({
        requestType: 'login',
        username: 'apcmini',
        password: '2c18e486683a3db1e645ad8523223b72',
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

  close() {
    if (this.client) this.client.close();
    console.log("🔚 Encerrado");
  }
}

export default MaController;
