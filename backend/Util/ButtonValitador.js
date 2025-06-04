const COLOR_CODES = {
  off: 0,
  green: 2,
  red: 6,
  yellow: 10
};
const VALID_COLORS = {
  0: 'Off',
  2: 'Green',
  6: 'Red',
  10: 'Yellow'
};

export class ButtonValidator {
  /**
   * Valida e corrige um botão individual.
   * @param {Object} button
   * @returns {{ isValid: boolean, sanitized?: Object, errors?: string[] }}
   */
  static validate(button) {
    const errors = [];

    // Validação básica
    if (typeof button.notation !== 'number') {
      errors.push('Notation ausente ou inválido');
    }

    // Validação e conversão da cor
    let colorCode;
    if (typeof button.color === 'string') {
      const colorLower = button.color.toLowerCase();
      colorCode = COLOR_CODES[colorLower];
      if (colorCode === undefined) {
        errors.push(`Cor inválida (${button.color}). Use: ${Object.keys(COLOR_CODES).join(', ')}`);
      }
    } else if (typeof button.color === 'number' && VALID_COLORS[button.color]) {
      colorCode = button.color;
    } else {
      errors.push(`Cor inválida (${button.color}). Use: ${Object.keys(COLOR_CODES).join(', ')}`);
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    // Retorna o botão validado e normalizado
    return {
      isValid: true,
      sanitized: {
        ...button,
        color: colorCode,
        colorName: VALID_COLORS[colorCode]
      }
    };
  }
}
