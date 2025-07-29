// src/utils/encryption.mjs

import crypto from 'crypto';
import { logger } from './logger.mjs'; // Asegúrate de tener un logger configurado

export function encrypt(str) {
    if (!process.env.ENCRYPTION_SECRET) {
        return null;
    }
    try {
        const iv = new crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', process.env.ENCRYPTION_SECRET, iv);
        const enc = cipher.update(str, 'utf8');
        return Buffer.concat([iv, enc]).toString("base64");
    } catch (error) {
        logger.error(error.message);
        return null;
    }
}

export function decrypt(enc) {
    if (!process.env.ENCRYPTION_SECRET) {
        return null;
    }
    try {
        enc = Buffer.from(enc, "base64");
        const iv = enc.slice(0, 16);
        enc = enc.slice(16, enc.length);
        const decipher = crypto.createDecipheriv('aes-256-gcm', process.env.ENCRYPTION_SECRET, iv);
        return decipher.update(enc, null, 'utf8');
    } catch (error) {
        logger.error(error.message);
        return null;
    }
}