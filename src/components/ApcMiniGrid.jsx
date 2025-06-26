// src/components/ApcMiniGrid.jsx
import { useState, useEffect } from 'react';
import ModalButtonConfig from './ModalButtonConfig';
import ModalFaderConfig from './ModalFaderConfig';
import ModalKnobConfig from './ModalKnobConfig';
import ButtonService from '../Service/buttonService.js';
import FaderService from '../Service/faderService.js';
import KnobService from '../Service/knobService.js';

const COLOR_MAP = {
  green: '#228B22',
  red: '#B22222',
  yellow: '#ECB753',
  off: '#3a3a3a',
};

// As constantes SAVED_KNOB_COLOR e DEFAULT_KNOB_COLOR já foram sinalizadas para remoção,
// pois a lógica de cor dos knobs agora é totalmente via CSS com classes e a variável --button-dynamic-color.
// Não estão mais sendo usadas aqui.

export default function ApcMiniGrid({ buttonLabels }) {
  const [editingButton, setEditingButton] = useState(null);
  const [editingFader, setEditingFader] = useState(null);
  const [editingKnob, setEditingKnob] = useState(null);
  const [buttonData, setButtonData] = useState([]);
  const [knobData, setKnobData] = useState([]);

  async function loadButtonConfig() {
    try {
      const data = await ButtonService.getButtons();
      const incoming = Array.isArray(data) ? data : [];
      const filled = Array.from({ length: 64 }, (_, idx) => {
        const found = incoming.find(b => b.notation === idx);
        return found
          ? { notation: idx, colorName: found.colorName }
          : { notation: idx, colorName: 'Off' };
      });
      setButtonData(filled);
    } catch (err) {
      console.error('Erro ao carregar configurações de botões:', err);
      const fallback = Array.from({ length: 64 }, (_, idx) => ({
        notation: idx,
        colorName: 'Off',
      }));
      setButtonData(fallback);
    }
  }

  async function loadKnobConfig() {
    try {
      const data = await KnobService.getKnobs();
      const incoming = Array.isArray(data) ? data : [];
      setKnobData(incoming);
    } catch (err) {
      console.error('Erro ao carregar configurações de knobs:', err);
      setKnobData([]);
    }
  }

  useEffect(() => {
    loadButtonConfig();
    loadKnobConfig();
  }, []);

  function getColorHex(colorName) {
    return COLOR_MAP[(colorName || 'off').toLowerCase()] || COLOR_MAP.off;
  }

  const displayData = buttonData.length === 64
    ? buttonData
    : Array.from({ length: 64 }, (_, idx) => ({
        notation: idx,
        colorName: 'Off',
      }));

  const gridRows = [];
  for (let row = 0; row < 8; row++) {
    const start = row * 8;
    const end = start + 8;
    gridRows.unshift(displayData.slice(start, end));
  }

  return (
    <div id="apc-mini">
      {gridRows.flat().map((btn) => {
        const baseLabel = Array.isArray(buttonLabels) && buttonLabels.length === 64
          ? buttonLabels[btn.notation]
          : `B${btn.notation}`;

        // ------ MUDANÇAS AQUI PARA OS BOTÕES -------
        const buttonColor = getColorHex(btn.colorName);

        // Determina se o botão deve ter a classe 'led'
        // Ele estará "aceso" se a cor não for a cor de "off"
        const isButtonLed = btn.colorName.toLowerCase() !== 'off';

        // Constrói a string de classes: "button" + " led" (se estiver aceso)
        const buttonClasses = `button ${isButtonLed ? 'led' : ''}`;

        return (
          <div
            key={btn.notation}
            className={buttonClasses} // <--- Aplica a classe condicionalmente
            data-index={baseLabel}
            style={{
              backgroundColor: buttonColor, // Mantém a cor de fundo inline
              '--button-dynamic-color': buttonColor // <--- DEFINE A VARIÁVEL CSS AQUI
            }}
            onClick={() => setEditingButton(btn.notation)}
          >
            {baseLabel}
          </div>
        );
      })}

      <div className="knobs-row">
        {Array.from({ length: 8}).map((_, i) => {
          const knobIndex = 64 + i;
          const hasSavedData = knobData.some(k => k.notation === knobIndex);

          const knobClassName = `knob ${hasSavedData ? 'saved' : ''}`;

          return (
            <div
              key={knobIndex}
              className="knob-container"
              onClick={() => setEditingKnob(knobIndex)}
            >
              <div
                className={knobClassName}
              ></div>
            </div>
          );
        })}
      </div>

      <div className="fader-row">
        {Array.from({ length: 8 }).map((_, i) => {
          const faderIndex = 48 + i;
          return (
            <div
              key={faderIndex}
              className="fader"
              data-index={`F${faderIndex}`}
              onClick={() => {
                if (faderIndex !== 55) setEditingFader(faderIndex);
              }}
              style={faderIndex === 55 ? { pointerEvents: 'none', opacity: 0.5 } : {}}
            >
              <div className="fader-track">
                <div className="fader-thumb"></div>
              </div>
              F{faderIndex}
            </div>
          );
        })}
      </div>

      <div className="control-buttons-row">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="control-button"></div>
        ))}
      </div>

      {editingButton !== null && (
        <ModalButtonConfig
          buttonIndex={editingButton}
          buttonConfig={displayData.find(b => b.notation === editingButton)}
          onClose={() => setEditingButton(null)}
          onUpdateButtons={loadButtonConfig}
        />
      )}
      {editingFader !== null && (
        <ModalFaderConfig faderIndex={editingFader} onClose={() => setEditingFader(null)} />
      )}
      {editingKnob !== null && (
        <ModalKnobConfig
          knobIndex={editingKnob}
          onClose={() => setEditingKnob(null)}
          onUpdateKnobs={loadKnobConfig}
        />
      )}
    </div>
  );
}