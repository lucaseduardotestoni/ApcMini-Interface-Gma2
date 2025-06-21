import crypto from 'crypto';

const senha = 'remote';
const hash = crypto.createHash('md5').update(senha).digest('hex');

console.log(hash); // Ex: 2c18e486683a3db1e645ad8523223b72
