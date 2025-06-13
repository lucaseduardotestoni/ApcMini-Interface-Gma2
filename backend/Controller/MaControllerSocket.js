import net from 'net';
import EventEmitter from 'events';

/**
 * Classe para controlar a grandMA2 via TCP.
 * Emite os eventos: 'connected', 'data', 'error', 'close'.
 */
class MaControllerSocket extends EventEmitter {
    /**
     * @param {object} options Opções de conexão.
     * @param {string} [options.host='127.0.0.1'] O endereço IP do servidor gMA2.
     * @param {number} [options.port=8080] A porta do servidor gMA2.
     */
    constructor({ host = '127.0.0.1', port = 8080 } = {}) {
        super();
        this.host = host;
        this.port = port;
        this.client = null;
        this.isConnected = false;
    }

    /**
     * Conecta-se ao servidor TCP da gMA2.
     * @returns {Promise<void>} Uma Promise que resolve quando conectado ou rejeita em caso de erro.
     */
    connect() {
        return new Promise((resolve, reject) => {
            if (this.client) {
                console.warn('Já existe uma tentativa de conexão em andamento.');
                reject(new Error('Conexão já existente ou em andamento.'));
                return;
            }

            this.client = new net.Socket();

            // Handler de erro principal
            const onError = (err) => {
                console.error('Erro na conexão:', err.message);
                this.isConnected = false;
                this.emit('error', err);
                this.client.destroy();
                this.client = null;
                reject(err); // Rejeita a promise de conexão
            };

            this.client.on('error', onError);

            this.client.connect(this.port, this.host, () => {
                console.log(`Conectado com sucesso ao servidor gMA2 em ${this.host}:${this.port}`);
                this.isConnected = true;
                
                // Remove o listener de erro de conexão para não duplicar o handler principal
                this.client.removeListener('error', onError);
                
                this.emit('connected');
                resolve(); // Resolve a promise de conexão
            });

            // Handlers para eventos pós-conexão
            this.client.on('data', (data) => {
                const response = data.toString().trim();
                // console.log('Resposta do servidor:', response);
                this.emit('data', response);
            });

            this.client.on('close', () => {
                console.log('Conexão encerrada.');
                this.isConnected = false;
                this.client = null;
                this.emit('close');
            });
        });
    }

    /**
     * Envia um objeto de comando para a gMA2.
     * O objeto será convertido para uma string JSON e uma quebra de linha será adicionada.
     * @param {object} commandObject O objeto de comando a ser enviado.
     */
    sendCommand(commandObject) {
        if (!this.isConnected || !this.client) {
            console.error('Não é possível enviar o comando: cliente não conectado.');
            return;
        }

        try {
            const jsonString = JSON.stringify(commandObject);
            const message = jsonString + '\n';
            console.log(`Enviando comando: ${jsonString}`);
            this.client.write(message);
        } catch (error) {
            console.error('Erro ao serializar o comando para JSON:', error);
        }
    }

    /**
     * Encerra a conexão TCP com o servidor.
     */
    disconnect() {
        if (this.client) {
            this.client.destroy();
            this.client = null;
            this.isConnected = false;
        }
    }
}

export default MaControllerSocket;