import { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class CustomCellRenderer implements ICellRendererComp {
    eGui: any;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        this.eGui.classList.add('my-custom-cell-renderer');
        this.eGui.innerHTML =
            /* html */
            `<div class="athlete-info">
            <span>${params.data.athlete}</span>
            <span>${params.data.country}</span>
        </div>
        <span>${params.data.year}</span>`;

        // creates the row dragger element
        var rowDragger = document.createElement('i');
        rowDragger.classList.add('fas', 'fa-arrows-alt-v');
        this.eGui.appendChild(rowDragger);

        // registers as a row dragger
        params.registerRowDragger(rowDragger, 0);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}
