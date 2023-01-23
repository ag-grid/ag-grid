import React from 'react';
import designSystemColors from '../../design-system/color.module.scss';
import styles from './color.module.scss';

const formatName = (name) => {
    return name.replace('ag-grid', 'AG Grid').replaceAll('-', ' ');
};

function hexToHSL(hex) {
    // Convert hex to RGB first
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

    return `${h},${s},${l}`;
}

export const Color = () => {
    const colors = Object.keys(designSystemColors);
    return (
        <div className={styles.swatches}>
            {colors.map((key) => {
                const hexColor = designSystemColors[key];
                return (
                    <div className={styles.swatch}>
                        <div
                            className={styles.color}
                            style={{
                                backgroundColor: hexColor,
                            }}
                        ></div>
                        <span className={styles.name}>{formatName(key)}</span>
                        <pre className={styles.sassName}>{key}</pre>

                        <pre className={styles.hexColor}>{hexColor}</pre>
                        <pre className={styles.hslColor}>{hexToHSL(hexColor)}</pre>
                    </div>
                );
            })}
        </div>
    );
};
