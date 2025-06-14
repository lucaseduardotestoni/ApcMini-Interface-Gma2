import { useState, useEffect } from 'react';
import ConfigService from '../Service/ConfigService';
import './styles/modal.css';

export default function ModalFaderConfig({ faderIndex, onClose }) {
  const [executor, setExecutor] = useState('1');
  const [page, setPage] = useState('0');

  useEffect(() => {
    const loadFaderConfig = async () => {
      try {
        const data = await ConfigService.getFader(faderIndex);
        setExecutor(data.executor ?? '1');
        setPage(data.page !== undefined ? String(data.page) : '0');
      } catch (err) {
        setExecutor('1');
        setPage('0');
      }
    };
    
    loadFaderConfig();
  }, [faderIndex]);
  const handleSave = async () => {
    const faderAlterado = {
      notation: faderIndex,
      executor,
      page: parseInt(page, 10) || 0
    };
    try {
      const result = await ConfigService.saveFaderConfig(faderAlterado);
      if (result && result.message && result.message.includes('sucesso')) {
        onClose();
      } else {
        alert('Erro ao salvar configuração do fader');
      }
    } catch (err) {
      alert('Erro ao salvar configuração do fader');
      console.error(err);
    }
  };

  return (
    <div className="modal" id="faderConfigModal">
      <div className="modal-content">
        <h2>Configurar fader {faderIndex}</h2>

        <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <label>
            Executor:
            <input
              type="text"
              name="executor"
              value={executor}
              onChange={e => setExecutor(e.target.value)}
            />
          </label>
          <label>
            Página:
            <input
              type="number"
              name="page"
              value={page}
              min="0"
              onChange={e => setPage(e.target.value)}
            />
          </label>
          <button type="submit">Salvar</button>
          <button type="button" onClick={onClose}>Fechar</button>
        </form>
      </div>
    </div>
  );
}
