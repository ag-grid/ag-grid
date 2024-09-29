import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class ColourCellRenderer implements ICellRendererComp {
    eGui!: HTMLDivElement;

    init(params: ICellRendererParams) {
        const eGui = (this.eGui = document.createElement('div'));
        eGui.style.overflow = 'hidden';
        eGui.style.textOverflow = 'ellipsis';

        const { value } = params;
        const colorSpan = document.createElement('span');
        const text = document.createTextNode(value || '');

        if (value != null) {
            colorSpan.style.borderLeft = '10px solid ' + params.value;
            colorSpan.style.paddingRight = '5px';
        }

        eGui.appendChild(colorSpan);
        eGui.append(text);
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return false;
    }
}
