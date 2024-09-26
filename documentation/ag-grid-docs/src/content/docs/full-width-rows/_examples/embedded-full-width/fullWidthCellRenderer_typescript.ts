import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class FullWidthCellRenderer implements ICellRendererComp {
    eGui!: HTMLDivElement;
    private cssClass!: string;
    private message!: string;

    init(params: ICellRendererParams) {
        // pinned rows will have node.rowPinned set to either 'top' or 'bottom' - see docs for row pinning
        if (params.pinned) {
            this.cssClass = 'example-full-width-pinned';
            this.message = `Pinned full width on ${params.pinned} - index ${params.node.rowIndex}`;
        } else {
            this.cssClass = 'example-full-width-row';
            this.message = `Non pinned full width row at index ${params.node.rowIndex}`;
        }

        this.eGui = document.createElement('div');

        this.eGui.innerHTML = `<div class="${this.cssClass}"><button>Click</button> ${this.message}</div>`;

        const eButton = this.eGui.querySelector('button')!;
        eButton.addEventListener('click', function () {
            alert('button clicked');
        });
    }

    getGui() {
        return this.eGui.firstChild as any;
    }

    refresh() {
        return false;
    }
}
