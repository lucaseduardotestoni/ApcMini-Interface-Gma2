import { useState } from 'react';
import './styles/modal.css';

export default function ModalButtonConfig({ buttonIndex, onClose }) {
  const [selectedColor, setSelectedColor] = useState('off');

  const handleSave = () => {
    const button = document.querySelector(`.button[data-index='${buttonIndex}']`);
    if (button) {
      let color = '#2b2b2b';
      if (selectedColor === 'green') color = '#228B22';
      if (selectedColor === 'red') color = '#B22222';
      if (selectedColor === 'yellow') color = '#ECB753';
      button.style.backgroundColor = color;
    }
    onClose();
  };

  return (
    <div className="modal" id="configModal">
      <div className="modal-content">
        <h2>Configurar botão {buttonIndex}</h2>

        <form>
          <label>
            Executor:
            <input type="text" name="executor" defaultValue={`101`} />
          </label>
          <label>
            Tipo:
            <select name="tipo">
              <option value="0">Go+</option>
              <option value="1">Flash</option>
              <option value="2">Toggle</option>
            </select>
          </label>
          <label>
            Página:
            <input type="number" name="page" defaultValue={0} min="0" />

          </label>
          <label>
            Cor:
            <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
              <option value="off">Off</option>
              <option value="green">Verde</option>
              <option value="red">Vermelho</option>
              <option value="yellow">Amarelo</option>
            </select>
          </label>
        </form>

        <button onClick={handleSave}>Salvar</button>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}
