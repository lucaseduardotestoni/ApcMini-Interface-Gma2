// Util/ButtonValidator.js

const COLOR_CODES = {
  off: 0,
  green: 1,
  red: 3,
  yellow: 5
};

const VALID_COLORS = {
  0: 'Off',
  1: 'Green',
  3: 'Red',
  5: 'Yellow'
};

export class ButtonValidator {
  static validate(button) {
    const errors = {}; // Usaremos um objeto para erros { campo: 'mensagem' }
    let isValid = true;
    const sanitized = { ...button }; // Começa com uma cópia do botão original

    // --- Validação e Sanitização de 'notation' ---
    if (typeof button.notation !== 'number' || !Number.isInteger(button.notation) || button.notation < 0) {
      errors.notation = 'Notation deve ser um número inteiro positivo.';
      isValid = false;
    } else {
      sanitized.notation = button.notation; // Garante que é um número
    }

    // --- Validação e Sanitização de 'executor' ---
    if (typeof button.executor !== 'string' || button.executor.trim() === '') {
      errors.executor = 'Executor deve ser uma string não vazia.';
      isValid = false;
    } else {
      sanitized.executor = button.executor.trim(); // Remove espaços em branco
    }
    // Opcional: Adicionar regex para formato específico de executor (ex: '101')
    // if (!/^\d{3}$/.test(sanitized.executor)) {
    //   errors.executor = 'Executor com formato inválido. Esperado 3 dígitos (ex: "101").';
    //   isValid = false;
    // }

    // --- Validação e Sanitização de 'type' ---
    // Aceita 'type' como número ou string que pode ser convertida
    const typeAsNumber = parseInt(button.type, 10);
    if (isNaN(typeAsNumber) || ![1, 2, 3].includes(typeAsNumber)) { // Exemplo: apenas 1, 2 ou 3 são válidos
      errors.type = 'Type deve ser um número válido (1, 2 ou 3).';
      isValid = false;
    } else {
      sanitized.type = typeAsNumber; // Converte para número
    }

    // --- Validação e Sanitização de 'page' ---
    // Aceita 'page' como número ou string que pode ser convertida
    const pageAsNumber = parseInt(button.page, 10);
    if (isNaN(pageAsNumber) || !Number.isInteger(pageAsNumber) || pageAsNumber < 1) {
      errors.page = 'Page deve ser um número inteiro positivo.';
      isValid = false;
    } else {
      sanitized.page = pageAsNumber; // Converte para número
    }

    // --- Validação e Sanitização de 'color' e 'colorName' ---
    let finalColorCode;
    let finalColorName;

    // Prioriza o código de cor se ele for um número válido
    if (typeof button.color === 'number' && VALID_COLORS.hasOwnProperty(button.color)) {
      finalColorCode = button.color;
      finalColorName = VALID_COLORS[button.color];
    }
    // Caso contrário, tenta converter a string do nome da cor para um código
    else if (typeof button.color === 'string') {
      const colorKey = button.color.toLowerCase();
      const codeFromKey = COLOR_CODES[colorKey];
      if (codeFromKey !== undefined) {
        finalColorCode = codeFromKey;
        finalColorName = VALID_COLORS[codeFromKey];
      } else {
        errors.color = `Cor inválida "${button.color}". Use um dos seguintes nomes: ${Object.keys(COLOR_CODES).join(', ')}.`;
        isValid = false;
      }
    }
    // Se 'color' não for nem número válido nem string válida
    else {
      errors.color = `Campo 'color' inválido. Esperado um número (código) ou uma string (nome da cor).`;
      isValid = false;
    }

    // Após determinar finalColorCode e finalColorName, atribua-os ao objeto sanitizado
    if (isValid || Object.keys(errors).length === 0) { // Se não houve erro grave no color, atribui
        sanitized.color = finalColorCode;
        sanitized.colorName = finalColorName;
    }


    // --- Retorno da Validação ---
    if (!isValid || Object.keys(errors).length > 0) {
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      sanitized: sanitized // Retorna o objeto com os campos padronizados
    };
  }
}