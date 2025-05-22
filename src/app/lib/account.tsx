"use client";
import * as ed from '@noble/ed25519';
import {sha512} from '@noble/hashes/sha2';
import { createDecipheriv, createHmac, createCipheriv, randomBytes} from 'node:crypto';
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

import scrypt from 'scrypt-js';

export class Keystore {
    version: number;
    id: string;
    pubkey: string;
    salt: string;
    tag: string;
    iv: string;
    ciphertext: string;
    mac: string;

    constructor() {
        this.version = 1;
        this.id = "";
        this.pubkey = "";
        this.salt = "";
        this.tag = "";
        this.iv = "";
        this.ciphertext = "";
        this.mac = "";
    }

}

function kdf(password: string, salt: string): Uint8Array{
    const encodedPassword = new TextEncoder().encode(password);
    const encodedSalt = new TextEncoder().encode(salt);
    return scrypt.syncScrypt(encodedPassword, encodedSalt, 1024, 8, 1, 64);
}

// function generateHmacSha256(key: string, message: string): string {
//     return createHmac('sha256', key).update(message).digest('hex');
// }

// function validateHmacSha256(key: string, message: string, expectedHmac: string): boolean {
//     const computedHmac = generateHmacSha256(key, message);
//     return computedHmac === expectedHmac;
// }

// 用密码加密保存private key
// password:登录密码，plaintext:私钥hex
export function keystore(password: string, plaintext: string): Keystore{
    const salt = crypto.randomUUID();
    const keysBuffer = kdf(password, salt);
    const aesKey = keysBuffer.slice(0, 32);
    const hmacKey = keysBuffer.slice(32, 64);

    // create a random 96-bit initialization vector (IV)
    // const iv = crypto.getRandomValues(new Uint8Array(12))
    // const iv = randomBytes(12).toString('hex');
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", aesKey, iv);
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const tag = cipher.getAuthTag();
    
    const hmac = createHmac('sha256', hmacKey)
        .update(ciphertext)
        .digest('hex');

    const result: Keystore = {
        version: 1,
        id: crypto.randomUUID(),
        pubkey: pubKey(plaintext),
        salt: salt,
        tag: tag.toString('hex'),
        iv: iv.toString('hex'),
        ciphertext: ciphertext,
        mac: hmac
    };
    return result;
}

/// 根据private key获取public key
export function pubKey(privateKeyHexStr: string): string {
    const privateKey = ed.etc.hexToBytes(privateKeyHexStr);
    const pubKey = ed.getPublicKey(privateKey);
    return ed.etc.bytesToHex(pubKey);
}

export function isValid(store: Keystore, password: string): boolean {
    const salt = store.salt;
    const keysBuffer = kdf(password, salt);
    const hmacKey = keysBuffer.slice(32, 64);
    const hmac = createHmac('sha256', hmacKey)
        .update(store.ciphertext)
        .digest('hex');
    return hmac === store.mac;
}

/// 获取私钥
export function privateKeyDecrypt(store: Keystore, password: string): string {
    const keysBuffer = kdf(password, store.salt);
    const hmacKey = keysBuffer.slice(32, 64);
    const hmac = createHmac('sha256', hmacKey)
        .update(store.ciphertext)
        .digest('hex');
    console.log("hmac:" + hmac);
    console.log("mac:" + store.mac);
    if (!(hmac === store.mac)) {
        throw new Error("Invalid password.");
    }
    const aesKey = keysBuffer.slice(0, 32);
    const iv = ed.etc.hexToBytes(store.iv);
    const tag = ed.etc.hexToBytes(store.tag);
    const decipher = createDecipheriv("aes-256-gcm", aesKey, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(store.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

//   // create or bring your own base64-encoded encryption key
//   const key = Buffer.from(
//     crypto.getRandomValues(new Uint8Array(32))
//   ).toString('base64');

// // encode the text you want to encrypt
// const encodedPlaintext = new TextEncoder().encode(plaintext);
// const encodedPassword = new TextEncoder().encode(password);