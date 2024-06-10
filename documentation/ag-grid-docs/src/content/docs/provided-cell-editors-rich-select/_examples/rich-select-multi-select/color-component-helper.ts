const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
};

export const getLuma = (color: string): number => {
    const span = document.createElement('span');
    document.body.appendChild(span);
    span.style.backgroundColor = color;

    let renderedColor = window.getComputedStyle(span).backgroundColor;
    document.body.removeChild(span);

    if (renderedColor.startsWith('rgb(')) {
        renderedColor = renderedColor.replace('rgb(', '');
        renderedColor = renderedColor.replace(')', '');
        const split: [number, number, number] = renderedColor.split(',').map((n) => parseInt(n)) as [
            number,
            number,
            number,
        ];
        renderedColor = rgbToHex(...split);
    }

    const c = renderedColor.substring(1);
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    return 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
};
