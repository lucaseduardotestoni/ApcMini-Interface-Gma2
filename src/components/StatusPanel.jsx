import { useState, useEffect } from 'react';
import ConfigService from '../Service/ConfigService.js';

export default function StatusPanel() {
  const [username, setUsername] = useState('apcmini');
  const [password, setPassword] = useState('remote');
  const [apcStatus, setApcStatus] = useState('Carregando...');
  const [apcDeviceName, setApcDeviceName] = useState('Não detectado');
  const [apcMidiPort, setApcMidiPort] = useState('N/A');
  const [maStatus, setMaStatus] = useState('Carregando...');
  const [maPort, setMaPort] = useState('N/A');

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

  useEffect(() => {
    async function updateApcMainStatus() {
      try {
        const apcdata = await ConfigService.getMidiStatus();
        
        if (apcdata.status === true) {
          setApcStatus('Conectado');
          setApcDeviceName(apcdata.deviceName || 'Não detectado');
          setApcMidiPort(apcdata.midiPort || 'N/A');
        } 
        const madata = await ConfigService.getMaStatus();
        if (madata.status === true){
          setMaStatus('Conectado');
          setMaPort(madata.port || 'N/A');
        }
      } catch (error) {
        console.error('Erro ao atualizar status do APC MINI:', error);
      }
    }

    updateApcMainStatus();
  }, []);


  return (
    <div className="status-panel">
      <h1>Painel de Status de Conexão</h1>

      <div className="device-status-section">
        <h2>APC Mini Status</h2>
        <div className="status-item">
          <span className="status-label">Status Principal:</span>
          <span
            id="apc-main-status"
            className={`status-value ${apcStatus === 'Conectado' ? 'status-green' : 'status-loading'}`}
          >
            {apcStatus}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Dispositivo Conectado:</span>
          <span id="apc-device-name" className="status-value">{apcDeviceName}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Porta MIDI:</span>
          <span id="apc-midi-port" className="status-value">{apcMidiPort}</span>
        </div>
      </div>

      <div className="device-status-section">
        <h2>grandMA2 Status</h2>
        <div className="status-item">
          <span className="status-label">Status Principal:</span>
          <span id="grandma-main-status" className={`status-value ${maStatus === 'Conectado' ? 'status-green' : 'status-loading'}`}>{maStatus}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Endereço IP:</span>
          <span id="grandma-ip" className="status-value">{maPort}</span>
        </div>
      </div>
      <div className="device-status-section">
        <h3>Credenciais de Acesso</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Usuário:
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </label>
          <label>
            Senha:
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>
          <button id="save-credentials-btn" className="action-button" type="submit">
            Salvar Credenciais
          </button>
        </form>
      </div>
    </div>
  );
}
