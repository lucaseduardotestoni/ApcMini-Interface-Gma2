// Services/cryptoService.js
import crypto from 'crypto';

export default function hashPasswordMD5(password) {
  if (typeof password !== 'string') {
    throw new Error('Senha deve ser uma string');
  }

  return crypto.createHash('md5').update(password).digest('hex');
}
