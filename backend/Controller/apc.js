import easymidi from 'easymidi';

class MidiHandler {
    constructor(deviceName) {
        this.deviceName = 'APC MINI';
        this.input = null;

        try {
            // Conecta-se à entrada MIDI
            this.input = new easymidi.Input(this.deviceName);
            console.log(`Conectado e ouvindo o dispositivo: "${this.deviceName}"`);

            // ----- Conecta os eventos MIDI aos seus métodos -----

            // 1. Eventos de Nota (para o seu método onNote)
            this.input.on('noteon', (msg) => {
                this.onNote(msg.note, msg.velocity, 'on');
            });

            this.input.on('noteoff', (msg) => {
                this.onNote(msg.note, msg.velocity, 'off');
            });

            // 2. Evento de Control Change (para o novo método onFader)
            this.input.on('cc', (msg) => {
                this.onFader(msg.controller, msg.value);
            });

        } catch (error) {
            console.error(`Erro: Não foi possível conectar ao dispositivo MIDI "${this.deviceName}".`);
            console.log('Dispositivos disponíveis:', easymidi.getInputs());
        }
    }

    /**
     * Este é o seu método para lidar com notas.
     * Ele é chamado quando uma tecla é pressionada ('on') ou solta ('off').
     */
    onNote(note, velocity, type) {
        console.log(`Nota: ${note}, Velocidade: ${velocity}, Tipo: ${type}`);
    }

    /**
     * Este é o novo método para lidar com faders e knobs.
     * Ele é chamado sempre que um controle CC é movido.
     * @param {number} controller - O ID do fader/knob (ex: 7).
     * @param {number} value - O valor do controle (0-127).
     */
    onFader(controller, value) {
        // Substitua este método ao instanciar ou modifique aqui
        console.log(`Controlador (Fader/Knob): ${controller}, Valor: ${value}`);

        // EXEMPLO: Como agir para um fader específico
        const FADER_DE_VOLUME = 7; // Suponha que o ID do seu fader de volume é 7
        if (controller === FADER_DE_VOLUME) {
            const volumePercent = Math.round((value / 127) * 100);
            console.log(`--- Fader de Volume principal está em ${volumePercent}% ---`);
            // Aqui você faria algo com o valor, como ajustar o volume de um áudio.
        }
    }

    // Você pode adicionar mais métodos para outros tipos de mensagens MIDI...
    // onPitch(value) { ... }
    // this.input.on('pitch', (msg) => this.onPitch(msg.value));
}

// --- Como usar a classe ---

// 1. Encontre o nome do seu dispositivo
// console.log(easymidi.getInputs());

// 2. Crie uma instância da sua classe com o nome do dispositivo
const NOME_DO_DISPOSITIVO = 'Nome do seu Controlador MIDI'; // << SUBSTITUA AQUI
const meuControlador = new MidiHandler(NOME_DO_DISPOSITIVO);

/*
// Se você quiser customizar os métodos depois de criar a instância:
meuControlador.onNote = (note, velocity, type) => {
    console.log(`Ação customizada para nota ${note}!`);
};

meuControlador.onFader = (controller, value) => {
    if (controller === 21) { // Um knob específico para efeitos
        console.log(`Knob de efeito (ID ${controller}) alterado para ${value}`);
    }
};
*/