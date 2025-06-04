import { useState } from 'react';
import './styles/modal.css';
import ConfigService from '../Service/configService.js';  

export default function ModalButtonConfig({ buttonIndex, onClose, onUpdateButtons }) {
  const [selectedColor, setSelectedColor] = useState('off');
  const [executor, setExecutor] = useState('101');
  const [tipo, setTipo] = useState('1');
  const [page, setPage] = useState('0');
   const loadButtonConfig = async () => {
    try {
      const data = await ConfigService.getButton(buttonIndex);
      setExecutor(data.executor ?? '101');
      setTipo(data.type !== undefined ? String(data.type) : '1');
      setPage(data.page !== undefined ? String(data.page) : '0');
      setSelectedColor(
        typeof data.color === 'string'
          ? data.color
          : (typeof data.colorName === 'string' ? data.colorName : 'off')
      );
    } catch (err) {
      // Se não encontrar, mantém valores padrão
      setExecutor('101');
      setTipo('1');
      setPage('0');
      setSelectedColor('off');
    }
  };
  // Carrega a configuração do botão ao montar o componente
  useState(() => {
    loadButtonConfig();
  }, [buttonIndex]);

  const handleSave = async () => {
    const botaoAlterado = {
      notation: buttonIndex, // alterado de 'index' para 'notation'
      executor,
      type: tipo,
      page,
      color: selectedColor
    };
   try {
    const result = await ConfigService.saveButtonConfig(botaoAlterado);
    // Verifica se a resposta indica sucesso
    if (result && result.message && result.message.includes('sucesso')) {
      if (onUpdateButtons) onUpdateButtons();
      onClose();
    } else {
      alert('Erro ao salvar configuração do botão');
    }
  } catch (err) {
    alert('Erro ao salvar configuração do botão');
    console.error(err);
  }
  };

  return (
    <div className="modal" id="configModal">
      <div className="modal-content">
        <h2>Configurar botão {buttonIndex}</h2>

        <form>
          <label>
            Executor:
            <input
              type="text"
              name="executor"
              value={executor}
              onChange={(e) => setExecutor(e.target.value)}
            />
          </label>

          <label>
            Tipo:
            <select
              name="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="1">Go+</option>
              <option value="2">Flash</option>
              <option value="2">Toggle</option>
            </select>
          </label>

          <label>
            Página:
            <input
              type="number"
              name="page"
              value={page}
              min="0"
              onChange={(e) => setPage(e.target.value)}
            />
          </label>

          <label>
            Cor:
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            >
              <option value="Off">Off</option>
              <option value="Green">Verde</option>
              <option value="Red">Vermelho</option>
              <option value="Yellow">Amarelo</option>
            </select>
          </label>
        </form>

        <button onClick={handleSave}>Salvar</button>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}
