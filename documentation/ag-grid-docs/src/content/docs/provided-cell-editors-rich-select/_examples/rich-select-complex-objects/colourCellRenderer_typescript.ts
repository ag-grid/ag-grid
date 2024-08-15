import { ICellRendererComp, ICellRendererParams } from '@ag-grid-community/core';

export class ColourCellRenderer implements ICellRendererComp {
    eGui!: HTMLDivElement;

    init(params: ICellRendererParams) {
        const eGui = (this.eGui = document.createElement('div'));

        const { name } = params.value;
        const text = document.createTextNode(name ?? '');
        eGui.append(text);
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return false;
    }
}
