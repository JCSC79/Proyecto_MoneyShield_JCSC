// scripts/encrypt-password.mjs

import 'dotenv/config'; // Carga variables de entorno desde .env
import { encrypt } from '../src/utils/encryption.mjs';

const password = process.argv[2] || 'contraseñaPorDefecto'; // Obtiene la contraseña desde los argumentos de la línea de comandos
const cifrada = encrypt(password);

if (cifrada) {
    console.log(`Contraseña original: ${password}`);
    console.log(`Contraseña cifrada (base64): `);
    console.log(cifrada);
} else {
  console.error('Error al cifrar la contraseña');
}