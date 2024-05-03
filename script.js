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
  const encrypted = 'cHDHk1/I2P0hXRuBS0ow51EH707NBx5+RwGAXm68EbLEzmqfr2ZQt2mmAzSt6iJ3eEOMmf4Qup4SGdHBitVGDoB7maNRn2d/NilG0Lw92WtvVTAeHq7Y4n58hQ9MzWnuCsQkfU176444LKv61nss5Aw4ngVgRlOl5uRZhj864ZTMOmRUkRUx/W/Uk+ZzkDjJsJCU0zDa3DN7AJoJjK4vphJFkdvLySJNXSGdgRlpCv1qw6ieuKZJu9jJIrcWIxPTnvm2E94MfViUYPkPW8O9wrnEUyqWHTyX0FR4iHONPO9lObogc1gXjzJUuTFPFCM6Eb0w1pUPD6Y=';
  const wrong = document.getElementById('wrong');
  const keybox = document.getElementById('key');
  let win;
  try {
    win = window.open();
    const decrypted = await aesGcmDecrypt(encrypted, key);
    win.location = decrypted;
    window.open(decrypted, '_blank');
    keybox.classList.remove('wrong');
    wrong.style.display = 'none';
  } catch (e) {
    win.close()
    wrong.style.display = 'block';
    keybox.classList.add('wrong');
  }
}