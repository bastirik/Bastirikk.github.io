/**
 * Encrypts plaintext using AES-GCM with supplied password, for decryption with aesGcmDecrypt().
 *                                                                      (c) Chris Veness MIT Licence
 *
 * @param   {String} plaintext - Plaintext to be encrypted.
 * @param   {String} password - Password to use to encrypt plaintext.
 * @returns {Promise<string>} Encrypted ciphertext.
 *
 * @example
 *   const ciphertext = await aesGcmEncrypt('my secret text', 'pw');
 *   aesGcmEncrypt('my secret text', 'pw').then(function(ciphertext) { console.log(ciphertext); });
 */
async function aesGcmEncrypt(plaintext, password) {
  const pwUtf8 = new TextEncoder().encode(password);                                 // encode password as UTF-8
  const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);                      // hash the password

  const iv = crypto.getRandomValues(new Uint8Array(12));                             // get 96-bit random iv
  const ivStr = Array.from(iv).map(b => String.fromCharCode(b)).join('');            // iv as utf-8 string

  const alg = { name: 'AES-GCM', iv: iv };                                           // specify algorithm to use

  const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']); // generate key from pw

  const ptUint8 = new TextEncoder().encode(plaintext);                               // encode plaintext as UTF-8
  const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8);                   // encrypt plaintext using key

  const ctArray = Array.from(new Uint8Array(ctBuffer));                              // ciphertext as byte array
  const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join('');             // ciphertext as string

  return btoa(ivStr + ctStr);                                                        // iv+ciphertext base64-encoded
}


/**
* Decrypts ciphertext encrypted with aesGcmEncrypt() using supplied password.
*                                                                      (c) Chris Veness MIT Licence
*
* @param   {String} ciphertext - Ciphertext to be decrypted.
* @param   {String} password - Password to use to decrypt ciphertext.
* @returns {Promise<string>} Decrypted plaintext.
*
* @example
*   const plaintext = await aesGcmDecrypt(ciphertext, 'pw');
*   aesGcmDecrypt(ciphertext, 'pw').then(function(plaintext) { console.log(plaintext); });
*/
async function aesGcmDecrypt(ciphertext, password) {
  const pwUtf8 = new TextEncoder().encode(password);                                 // encode password as UTF-8
  const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);                      // hash the password

  const ivStr = atob(ciphertext).slice(0, 12);                                       // decode base64 iv
  const iv = new Uint8Array(Array.from(ivStr).map(ch => ch.charCodeAt(0)));          // iv as Uint8Array

  const alg = { name: 'AES-GCM', iv: iv };                                           // specify algorithm to use

  const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']); // generate key from pw

  const ctStr = atob(ciphertext).slice(12);                                          // decode base64 ciphertext
  const ctUint8 = new Uint8Array(Array.from(ctStr).map(ch => ch.charCodeAt(0)));     // ciphertext as Uint8Array
  // note: why doesn't ctUint8 = new TextEncoder().encode(ctStr) work?

  try {
    const plainBuffer = await crypto.subtle.decrypt(alg, key, ctUint8);              // decrypt ciphertext using key
    const plaintext = new TextDecoder().decode(plainBuffer);                         // plaintext from ArrayBuffer
    return plaintext;                                                                // return the plaintext
  } catch (e) {
    throw new Error('Decrypt failed');
  }
}

async function encrypt(plaintext, key) {
  const encrypted = await aesGcmEncrypt(plaintext, key);
  console.log(encrypted);
}

async function access(key) {
  const encrypted = 'OIjh4Se6cqIVFHXnvwQXsyT8Sjq2/K3TRJsQeh6ua7fNpFd1xGOAIKityzhGFDyzylDqYpylI8JgTm+0Et2DsSrLL/CdxLxfYwSwTEnJ+emouCsViPKFqZKaCF2xPIIwMalpd0FeeH0HVUzREES32ay9aa8Vw+/je0N9m0sbYlJ8R4i46eEL3WZEvtd6qWnP6hzn+n8vcWVN1CTinerNTId4GWWU/ZV3kn5tS8Olq8z3BE6x9EQCz2fucc97E9yqdeMUfzZngnTcE705R0UaIXDDvXaW75L1c5PrTcsyRaueThWvTqvolgKcyYMUdZGQ+rdHrCoCm+HEhpvGFZPZ6yzUzcMAO3gXj7d2Yks/lbhYMUwFyw==';
  const wrong = document.getElementById('wrong');
  const keybox = document.getElementById('key');
  try {
    const decrypted = await aesGcmDecrypt(encrypted, key);
    window.open(decrypted, '_blank');
    keybox.classList.remove('wrong');
    wrong.style.display = 'none';
  } catch (e) {
    console.log('Wrong password!');
    wrong.style.display = 'block';
    keybox.classList.add('wrong');
  }
}