import { ICellRendererParams, ICellRendererComp } from "@ag-grid-community/core";

export class ColourCellRenderer implements ICellRendererComp {
    eGui!: HTMLDivElement;

    init(params: ICellRendererParams) {
        const eGui = this.eGui = document.createElement('div');
        const colorSpan = document.createElement('span');
        const text = document.createTextNode(params.value);
        colorSpan.style.borderLeft = '10px solid ' + params.value;
        colorSpan.style.paddingRight = '5px';

        eGui.appendChild(colorSpan)
        eGui.append(text);
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return false
    }
}

