/**
 * Convert bytes to an ASCII hexadecimal PDF stream payload.
 * @param data - Binary stream bytes.
 * @returns ASCII hexadecimal data terminated for `ASCIIHexDecode`.
 */
export function encodeAsciiHex(data: Uint8Array): string {
    const parts: string[] = [];
    const chunkSize = 2048;

    for (let start = 0; start < data.length; start += chunkSize) {
        const end = Math.min(start + chunkSize, data.length);
        let chunk = '';
        for (let index = start; index < end; index++) {
            chunk += data[index].toString(16).padStart(2, '0');
        }
        parts.push(chunk);
    }

    return `${parts.join('\n')}>`;
}

/**
 * Decode base64 data with an optional data URL prefix.
 * @param value - Base64 or data URL value.
 * @returns Decoded bytes.
 */
export function decodeBase64(value: string): Uint8Array {
    const separatorIndex = value.indexOf(',');
    const encoded = separatorIndex >= 0 ? value.slice(separatorIndex + 1) : value;
    let decoded: string;
    try {
        decoded = atob(encoded.replace(/\s/g, ''));
    } catch {
        throw new Error('AG Grid: PDF image data is not valid base64.');
    }
    const bytes = new Uint8Array(decoded.length);

    for (let index = 0; index < decoded.length; index++) {
        bytes[index] = decoded.charCodeAt(index);
    }

    return bytes;
}
