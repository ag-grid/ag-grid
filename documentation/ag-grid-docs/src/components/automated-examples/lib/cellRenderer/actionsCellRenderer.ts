import type { ICellRendererComp } from 'ag-grid-community';

export class ActionsCellRenderer implements ICellRendererComp {
    eGui!: HTMLDivElement;

    init() {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = `<button class="font-size-small">Do it</button>`;
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return true;
    }
}
