import { useState } from 'react';
import ConfigService from '../Service/ConfigService.js';
export default function StatusPanel() {
  const [username, setUsername] = useState('apcmini');
  const [password, setPassword] = useState('remote');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ConfigService.saveConfig({
        credentials: {
          username,
          password
        }
      });
      alert('Credenciais salvas com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar as credenciais');
    }
  };
  return (
    <div className="status-panel">
      <h1>Painel de Status de Conexão</h1>

            <div className="device-status-section">
                <h2>APC Mini Status</h2>
                <div className="status-item">
                    <span className="status-label">Status Principal:</span>
                    <span id="apc-main-status" className="status-value status-loading">Carregando...</span>
                </div>
                <div className="status-item">
                    <span className="status-label">Dispositivo Conectado:</span>
                    <span id="apc-device-name" className="status-value">Não detectado</span>
                </div>
                <div className="status-item">
                    <span className="status-label">Porta MIDI:</span>
                    <span id="apc-midi-port" className="status-value">N/A</span>
                </div>
            </div>

         <div className="device-status-section">
                <h2>grandMA2 Status</h2>
                <div className="status-item">
                    <span className="status-label">Status Principal:</span>
                    <span id="grandma-main-status" className="status-value status-loading">Carregando...</span>
                </div>
                <div className="status-item">
                    <span className="status-label">Endereço IP:</span>
                    <span id="grandma-ip" className="status-value">N/A</span>
                </div>
                <div className="status-item">
                    <span className="status-label">Versão do Software:</span>
                    <span id="grandma-version" className="status-value">N/A</span>
                </div>
            </div>
      <div className="device-status-section">
        <h3>Credenciais de Acesso</h3>
        <form >
          <label>
            Usuário:
            <input id="username" type="text" defaultValue="apcmini" />
          </label>
          <label>
            Senha:
            <input id="password" type="password" defaultValue="remote" />
          </label>
          <button id="save-credentials-btn" className="action-button" type="submit">Salvar Credenciais</button>
        </form>
      </div>
    </div>
  );
}
