export const formatName = (name) => {
    return name.replace('ag-grid', 'AG Grid').replaceAll('-', ' ');
};

export function hexToRGB(hex) {
    if (!hex) {
        return;
    }

    let r = 0,
        g = 0,
        b = 0;
    if (hex.length === 4) {
        r = parseInt('0x' + hex[1] + hex[1]);
        g = parseInt('0x' + hex[2] + hex[2]);
        b = parseInt('0x' + hex[3] + hex[3]);
    } else if (hex.length === 7) {
        r = parseInt('0x' + hex[1] + hex[2]);
        g = parseInt('0x' + hex[3] + hex[4]);
        b = parseInt('0x' + hex[5] + hex[6]);
    }

    return [r, g, b];
}

export function isLight(hex) {
    if (!hex) {
        return;
    }

    let [r, g, b] = hexToRGB(hex)!;

    return (r + g + b) / 3 > 150;
}

export function hexToHSL(hex) {
    if (!hex) {
        return;
    }

    // Convert hex to RGB first
    let [r, g, b] = hexToRGB(hex)!;

    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;

    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0) {
        h = 0;
    } else if (cmax == r) {
        h = ((g - b) / delta) % 6;
    } else if (cmax == g) {
        h = (b - r) / delta + 2;
    } else {
        h = (r - g) / delta + 4;
    }

    h = Math.round(h * 60);

    if (h < 0) {
        h += 360;
    }

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return `hsl(${h}, ${s}%, ${l}%)`;
}
