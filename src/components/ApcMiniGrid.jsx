// src/components/ApcMiniGrid.jsx
import { useState, useEffect } from 'react';
import ModalButtonConfig from './ModalButtonConfig';
import ModalFaderConfig from './ModalFaderConfig';
import ModalKnobConfig from './ModalKnobConfig';
import ConfigService from '../Service/configService.js';

const COLOR_MAP = {
  green: '#228B22',
  red: '#B22222',
  yellow: '#ECB753',
  off: '#3a3a3a',
};

export default function ApcMiniGrid({ buttonLabels }) {
  const [editingButton, setEditingButton] = useState(null);
  const [editingFader, setEditingFader] = useState(null);
  const [editingKnob, setEditingKnob] = useState(null);
  const [buttonData, setButtonData] = useState([]);

 

  // Use useEffect para carregar ao montar e quando quiser atualizar
  async function loadButtonConfig() {
    try {
      const data = await ConfigService.getConfig();
      const incoming = Array.isArray(data?.controls?.buttons)
        ? data.controls.buttons
        : [];
      const filled = Array.from({ length: 64 }, (_, idx) => {
        const found = incoming.find(b => b.notation === idx);
        return found
          ? { notation: idx, colorName: found.colorName }
          : { notation: idx, colorName: 'Off' };
      });
      setButtonData(filled);
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
      const fallback = Array.from({ length: 64 }, (_, idx) => ({
        notation: idx,
        colorName: 'Off',
      }));
      setButtonData(fallback);
    }
  }

  useEffect(() => {
    loadButtonConfig();
  }, []);

  function getColorHex(colorName) {
    return COLOR_MAP[(colorName || 'off').toLowerCase()] || COLOR_MAP.off;
  }

  // Se buttonData não tiver 64 itens, monta default
  const displayData = buttonData.length === 64
    ? buttonData
    : Array.from({ length: 64 }, (_, idx) => ({
        notation: idx,
        colorName: 'Off',
      }));

  // Monta o grid invertendo as linhas (B0 no topo esquerdo, B63 embaixo direito)
  const gridRows = [];
  for (let row = 0; row < 8; row++) {
    const start = row * 8;
    const end = start + 8;
    gridRows.unshift(displayData.slice(start, end)); // unshift inverte as linhas
  }

  return (
    <div id="apc-mini">
      {gridRows.flat().map((btn) => {
        const baseLabel = Array.isArray(buttonLabels) && buttonLabels.length === 64
          ? buttonLabels[btn.notation]
          : `B${btn.notation}`;

        return (
          <div
            key={btn.notation}
            className="button"
            data-index={baseLabel}
            style={{ backgroundColor: getColorHex(btn.colorName) }}
            onClick={() => setEditingButton(btn.notation)}
          >
            {baseLabel}
          </div>
        );
      })}

      <div className="knobs-row">
        {Array.from({ length: 8 }).map((_, i) => {
          const knobIndex = 64 + i;
          return (
            <div
              key={knobIndex}
              className="knob-container"
              onClick={() => setEditingKnob(knobIndex)}
            >
              <div className="knob"></div>
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
              onClick={() => setEditingFader(faderIndex)}
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
          // Passa o objeto completo para o modal, caso queira usar colorName/tipo
          buttonConfig={displayData.find(b => b.notation === editingButton)}
          onClose={() => setEditingButton(null)}
          onUpdateButtons={loadButtonConfig} // Passe para atualizar após salvar
        />
      )}
      {editingFader !== null && (
        <ModalFaderConfig faderIndex={editingFader} onClose={() => setEditingFader(null)} />
      )}
      {editingKnob !== null && (
        <ModalKnobConfig knobIndex={editingKnob} onClose={() => setEditingKnob(null)} />
      )}
    </div>
  );
}
