import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class ShowCellRenderer implements ICellRendererComp {
    ui!: HTMLSpanElement;

    init(params: ICellRendererParams) {
        const cellBlank = !params.value;
        if (cellBlank) {
            return;
        }

        this.ui = document.createElement('div');
        this.ui.innerHTML =
            '<div class="show-name">' +
            params.value.name +
            '' +
            '</div>' +
            '<div class="show-presenter">' +
            params.value.presenter +
            '</div>';
    }

    getGui() {
        return this.ui;
    }

    refresh() {
        return false;
    }
}
