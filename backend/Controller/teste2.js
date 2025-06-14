// testMaController.js

// Importa a classe MaController
import MaController from './MaControllerWeb.js'; // Ajuste o caminho se MaController.js estiver em outro lugar

// Configurações (ajuste conforme necessário)
const WEBSOCKET_URL = 'ws://localhost:80/'; // URL do WebSocket da sua GrandMA2
const WING_ID = 1; // ID da wing, se aplicável
const TEST_MODE = false; // Mantenha como false para interagir com a GrandMA2 real

// Instancie o controlador
const ma = new MaController({
    websocketURL: WEBSOCKET_URL,
    wing: WING_ID,
    testMode: TEST_MODE
});

// --- Variáveis para depuração ---
let sessionObtained = false;
let commandSent = false;
let commandResponseReceived = false;

// --- Event Listeners para Depuração ---

// Evento de conexão
ma.on('connected', () => {
    console.log("✅ Controlador MA conectado ao WebSocket.");
});

// Evento de sessão (crucial para saber quando podemos enviar comandos)
ma.on('session', (session) => {
    console.log(`🔑 Sessão atualizada: ${session}. Agora podemos enviar comandos.`);
    sessionObtained = true;

    // Tente enviar um comando após obter a sessão
    // Exemplo: Limpar a linha de comando
    // Adapte o comando conforme o que você quer testar
    if (!commandSent) {
        console.log("Tentando enviar o comando 'ClearAll'...");
        ma.sendCommand("Toggle executor 101"); // Comando de exemplo
        commandSent = true;
    }
});

// Evento de desconexão
ma.on('disconnected', () => {
    console.log("❌ Controlador MA desconectado.");
});

// Evento de erro (você já tem um console.error dentro da classe, mas é bom ter aqui também)
ma.on('error', (err) => {
    console.error("❗ Erro no controlador MA:", err);
});

// Evento principal para todas as mensagens recebidas do WebSocket
ma.on('message', (msg) => {
    // console.log("🔍 Mensagem recebida do MA:", JSON.stringify(msg, null, 2)); // Descomente para ver todas as mensagens

    // Verifique se a mensagem é uma resposta ao seu comando
    if (msg.responseType === "command" && commandSent && !commandResponseReceived) {
        console.log("\n--- RESPOSTA AO COMANDO ENVIADO ---");
        console.log("Comando Enviado: 'ClearAll' (exemplo)");
        console.log("Resposta Recebida:", JSON.stringify(msg, null, 2));
        console.log("-----------------------------------\n");
        commandResponseReceived = true;

        // Se quiser testar outro comando, ou fechar a conexão
        setTimeout(() => {
            console.log("Tentando enviar o comando 'Go+ Sequence 1'...");
            ma.sendCommand("Go+ Sequence 1"); // Outro comando de exemplo
            
            // Defina commandResponseReceived para false para esperar a próxima resposta
            commandResponseReceived = false; 
        }, 3000); // Espere 3 segundos antes de enviar o próximo comando
    }

    // Se o GrandMA2 retornar mensagens de texto (por exemplo, erros de comando)
    if (msg.text) {
        console.log("👉 Mensagem de texto do MA:", msg.text);
    }
});


// --- Lógica para Fechar o Teste (Opcional) ---
// Você pode adicionar um temporizador para fechar a conexão após um tempo
setTimeout(() => {
    if (ma.client && ma.client.readyState === 1) {
        ma.close();
        console.log("Teste finalizado. Conexão WebSocket fechada.");
    } else {
        console.log("Teste finalizado. WebSocket já estava desconectado.");
    }
    process.exit(0); // Força a saída do processo Node.js
}, 15000); // Fecha após 15 segundos para fins de teste. Ajuste conforme necessário.