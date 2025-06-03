export default function StatusPanel() {
  return (
    <div className="status-panel">
      <h1>Painel de Status de Conexão</h1>

            <div class="device-status-section">
                <h2>APC Mini Status</h2>
                <div class="status-item">
                    <span class="status-label">Status Principal:</span>
                    <span id="apc-main-status" class="status-value status-loading">Carregando...</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Dispositivo Conectado:</span>
                    <span id="apc-device-name" class="status-value">Não detectado</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Porta MIDI:</span>
                    <span id="apc-midi-port" class="status-value">N/A</span>
                </div>
            </div>

         <div class="device-status-section">
                <h2>grandMA2 Status</h2>
                <div class="status-item">
                    <span class="status-label">Status Principal:</span>
                    <span id="grandma-main-status" class="status-value status-loading">Carregando...</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Endereço IP:</span>
                    <span id="grandma-ip" class="status-value">N/A</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Versão do Software:</span>
                    <span id="grandma-version" class="status-value">N/A</span>
                </div>
            </div>
      <div className="device-status-section">
        <h3>Credenciais de Acesso</h3>
        <form>
          <label>
            Usuário:
            <input id="username" type="text" defaultValue="apcmini" />
          </label>
          <label>
            Senha:
            <input id="password" type="password" defaultValue="remote" />
          </label>
          <button id="save-credentials-btn" class="action-button" type="submit">Salvar Credenciais</button>
        </form>
      </div>
    </div>
  );
}
