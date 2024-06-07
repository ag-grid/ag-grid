import type { ICellRendererComp, ICellRendererParams } from '@ag-grid-community/core';

export class ColourCellRenderer implements ICellRendererComp {
    eGui!: HTMLDivElement;

    init(params: ICellRendererParams) {
        const eGui = (this.eGui = document.createElement('div'));
        eGui.style.overflow = 'hidden';
        eGui.style.textOverflow = 'ellipsis';

        const { value } = params;
        const values = Array.isArray(value) ? value : [value];
        const len = values.length;

        for (let i = 0; i < len; i++) {
            const currentValue = values[i];
            const colorSpan = document.createElement('span');
            let textValue = currentValue ?? '';

            if (i !== len - 1) {
                textValue += ', ';
            }

            const text = document.createTextNode(textValue);

            if (currentValue != null) {
                colorSpan.style.borderLeft = '10px solid ' + currentValue;
                colorSpan.style.paddingRight = '2px';
            }

            eGui.appendChild(colorSpan);
            eGui.append(text);
        }
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return false;
    }
}
