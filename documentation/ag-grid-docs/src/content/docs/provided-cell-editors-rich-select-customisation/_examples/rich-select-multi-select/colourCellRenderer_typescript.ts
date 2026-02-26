import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

const createPill = (color: string) => {
    const colorSpan = document.createElement('span');
    const text = document.createTextNode(color);

    colorSpan.style.backgroundColor = `color-mix(in srgb, transparent, ${color} 20%)`;
    colorSpan.style.boxShadow = `0 0 0 1px color-mix(in srgb, transparent, ${color} 50%)`;
    colorSpan.style.borderColor = color;
    colorSpan.append(text);

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
