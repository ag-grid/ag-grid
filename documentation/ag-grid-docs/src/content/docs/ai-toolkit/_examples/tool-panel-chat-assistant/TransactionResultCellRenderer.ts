import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class TransactionResultCellRenderer implements ICellRendererComp {
    eGui!: HTMLSpanElement;

    // Optional: Params for rendering. The same params that are passed to the cellRenderer function.
    init(params: ICellRendererParams) {
        const icon: HTMLImageElement = document.createElement('img');
        icon.src = `https://www.ag-grid.com/example-assets/icons/${params.value === 'Completed' ? 'tick-in-circle' : 'cross-in-circle'}.png`;
        icon.setAttribute('style', 'width: auto; height: auto;');

        this.eGui = document.createElement('span');
        this.eGui.setAttribute('style', 'display: flex; justify-content: center; height: 100%; align-items: center');
        this.eGui.appendChild(icon);
    }

    // Required: Return the DOM element of the component, this is what the grid puts into the cell
    getGui() {
        return this.eGui;
    }

    // Required: Get the cell to refresh.
    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}
