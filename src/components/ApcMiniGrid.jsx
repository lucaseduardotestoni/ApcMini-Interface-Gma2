import { useState } from 'react';
import ModalButtonConfig from './ModalButtonConfig';
import ModalFaderConfig from './ModalFaderConfig';
import ModalKnobConfig from './ModalKnobConfig';

export default function ApcMiniGrid() {
  const [editingButton, setEditingButton] = useState(null);
  const [editingFader, setEditingFader] = useState(null);
  const [editingKnob, setEditingKnob] = useState(null);

  return (
    <div id="apc-mini">
      {Array.from({ length: 64 }).map((_, index) => (
        <div
          key={index}
          className="button" data-index={index} 
          onClick={() => setEditingButton(index)}
        >
          B{index}
        </div>
      ))}

      <div className="knobs-row">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="knob-container"
            onClick={() => setEditingKnob(index)}
          >
            <div className="knob"></div>
          </div>
        ))}
      </div>

      <div className="fader-row">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="fader"
            onClick={() => setEditingFader(index)}
          >
            <div className="fader-track">
              <div className="fader-thumb"></div>
            </div>
            F{index}
          </div>
        ))}
      </div>

      <div className="control-buttons-row">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="control-button"
          >
          </div>
        ))}
      </div>

      {editingButton !== null && (
        <ModalButtonConfig buttonIndex={editingButton} onClose={() => setEditingButton(null)} />
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
