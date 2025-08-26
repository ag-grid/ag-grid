// https://rules.sonarsource.com/javascript/type/Security%20Hotspot/RSPEC-2245/

export const _safeRandom = () => {
    const crypto = window.crypto || (window as any)['msCrypto'];
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    // scale value to 0..1
    return array[0] / 0x100000000;
};
