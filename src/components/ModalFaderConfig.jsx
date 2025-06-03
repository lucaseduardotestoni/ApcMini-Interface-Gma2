import './styles/modal.css';

export default function ModalFaderConfig({ faderIndex, onClose }) {
  return (
    <div className="modal" id="faderConfigModal">
      <div className="modal-content">
        <h2>Configurar fader {faderIndex}</h2>

        <form>
          <label>
            Executor:
            <input type="text" name="executor" defaultValue={`1`} />
          </label>
          <br />
          <label>
            Página:
            <input type="number" name="page" defaultValue={0} min="0" />
          </label>
        </form>

        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}
