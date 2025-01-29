import type { ICellRendererParams } from 'ag-grid-community';

export function PriceRenderer(params: ICellRendererParams) {
    let priceMultiplier = 1;

    if (params.value > 300_000_000_000) {
        priceMultiplier = 5;
    } else if (params.value > 20_000_000_000) {
        priceMultiplier = 4;
    } else if (params.value > 10_000_000_000) {
        priceMultiplier = 3;
    } else if (params.value > 5_000_000_000) {
        priceMultiplier = 2;
    }

    const priceSpan = document.createElement('span');
    priceSpan.setAttribute('class', 'imgSpan');
    for (let i = 0; i < priceMultiplier; i++) {
        const priceElement = document.createElement('img');
        priceElement.src = `https://www.ag-grid.com/example-assets/icons/pound-coin-color-icon.svg`;
        priceElement.setAttribute('class', 'priceIcon');
        priceSpan.appendChild(priceElement);
    }
    return priceSpan;
}
