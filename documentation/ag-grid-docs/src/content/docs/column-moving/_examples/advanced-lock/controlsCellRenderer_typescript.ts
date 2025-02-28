import type { ICellRendererComp } from 'ag-grid-community';

// simple cell renderer returns dummy buttons. in a real application, a component would probably
// be used with operations tied to the buttons. in this example, the cell renderer is just for
// display purposes.
export class ControlsCellRenderer implements ICellRendererComp {
    eGui!: HTMLDivElement;

    init() {
        this.eGui = document.createElement('div');

        const button = document.createElement('button');
        button.textContent = 'Action';
        this.eGui.appendChild(button);
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return false;
    }
}
