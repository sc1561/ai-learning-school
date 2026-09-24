const asText = bytes => new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));

export function transformClue(value, method) {
  const source = value.trim();
  if (!source) throw new Error('أدخل نصًا تدريبيًا أولًا');
  if (source.length > 1000) throw new Error('النص طويل؛ اختر قرينة قصيرة من الملف');
  if (method === 'hex') {
    const clean = source.replace(/\s+/g, '');
    if (!/^(?:[\da-fA-F]{2})+$/.test(clean)) throw new Error('اكتب أزواجًا صحيحة من رموز Hex');
    return asText(clean.match(/.{2}/g).map(pair => parseInt(pair, 16)));
  }
  if (method === 'base64') {
    const clean = source.replace(/\s+/g, '');
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(clean)) throw new Error('صيغة Base64 غير صحيحة');
    return asText(Array.from(atob(clean), char => char.charCodeAt(0)));
  }
  if (method === 'shift-back') return source.replace(/[a-zA-Z]/g, char => String.fromCharCode((char >= 'a' ? 97 : 65) + (char.charCodeAt(0) - (char >= 'a' ? 97 : 65) + 25) % 26));
  throw new Error('طريقة غير مدعومة');
}
