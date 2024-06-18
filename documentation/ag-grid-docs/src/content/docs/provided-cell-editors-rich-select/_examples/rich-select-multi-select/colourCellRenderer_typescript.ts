import type { ICellRendererComp, ICellRendererParams } from '@ag-grid-community/core';

import { getLuma } from './color-component-helper';

const createPill = (color: string) => {
    const colorSpan = document.createElement('span');
    const text = document.createTextNode(color);

    colorSpan.style.backgroundColor = color;
    colorSpan.append(text);

    if (getLuma(color) < 150) {
        colorSpan.classList.add('dark');
    }

    return colorSpan;
};

const createTag = (color: string) => {
    const colorSpan = document.createElement('span');
    const text = document.createTextNode(color);

    colorSpan.style.borderColor = color;
    colorSpan.appendChild(text);

    return colorSpan;
};

export class ColourCellRenderer implements ICellRendererComp {
    eGui!: HTMLDivElement;

    init(params: ICellRendererParams) {
        const eGui = (this.eGui = document.createElement('div'));
        eGui.classList.add('custom-color-cell-renderer');

        const { value } = params;

        let values: string[] = [];

        if (Array.isArray(value)) {
            eGui.classList.add('color-pill');
            values = value;
        } else {
            eGui.classList.add('color-tag');
            values = [value];
        }

        const len = values.length;

        for (let i = 0; i < len; i++) {
            const currentValue = values[i];
            if (currentValue == null || currentValue === '') {
                continue;
            }

            const el = eGui.classList.contains('color-pill') ? createPill(currentValue) : createTag(currentValue);

            eGui.appendChild(el);
        }
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return false;
    }
}
