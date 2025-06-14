import EventEmitter from 'events';
import pkg from 'websocket';
const { w3cwebsocket } = pkg;

class MaController extends EventEmitter {
  constructor({
    websocketURL = 'ws://localhost:80/',
    wing = 1,
    testMode = false,
  } = {}) {
    super();

    this.websocketURL = websocketURL;
    this.wing = wing;
    this.testMode = testMode;

    this.session = 0;
    this.blackout = 0;
    this.ledMatrix = Array(90).fill(0);

    this.connectWebSocket();
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
      this.client.send(JSON.stringify(data));
    } else {
      console.warn("🚫 WebSocket não está conectado");
    }
  }

  // ==== MÉTODOS PARA COMANDOS GRANDMA2 ====

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
    this.sendWS({
      command: cmd,
      requestType: "command",
      session: this.session,
      maxRequests: 0,
    });
  }

  // ==== SIMULAÇÃO DE INPUTS PARA TESTE ====

  simulateNoteOn(note) {
    const execIndex = this.mapNoteToExec(note);
    if (execIndex !== null) {
      this.sendPlaybackButton(execIndex, 0, 0, true);
    }
    if (note === 98) {
      this.sendCommand('SpecialMaster 2.1 At 0');
      this.blackout = 1;
    }
  }

  simulateNoteOff(note) {
    const execIndex = this.mapNoteToExec(note);
    if (execIndex !== null) {
      this.sendPlaybackButton(execIndex, 0, 0, false);
    }
    if (note === 98) {
      this.sendCommand('SpecialMaster 2.1 At 100');
      this.blackout = 0;
    }
  }

  simulateCC(controller, value) {
    const faderValue = value / 127;
    const execIndex = this.mapControllerToExec(controller);
    if (execIndex !== null) {
      this.sendFader(execIndex, 0, faderValue);
    }
  }

  mapNoteToExec(note) {
    if (note >= 0 && note <= 63) {
      return 100 + note;
    }
    return null;
  }

  mapControllerToExec(controller) {
    if (controller >= 48 && controller <= 56) {
      return 200 + (controller - 48);
    }
    return null;
  }

  handleWSMessage(msg) {
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

    this.emit('message', msg);
  }

  close() {
    if (this.client) this.client.close();
    console.log("🔚 Encerrado");
  }
}
export default MaController;

