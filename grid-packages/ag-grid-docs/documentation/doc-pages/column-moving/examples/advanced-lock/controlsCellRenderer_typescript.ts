import { IStatusPanelComp, ICellRendererComp } from "@ag-grid-community/core";

// simple cell renderer returns dummy buttons. in a real application, a component would probably
// be used with operations tied to the buttons. in this example, the cell renderer is just for
// display purposes.
export class ControlsCellRenderer implements ICellRendererComp {
    eGui!: HTMLDivElement;

    init() {
        this.eGui = document.createElement('div');

        let button = document.createElement('button')
        button.innerText = 'A';
        this.eGui.appendChild(button);

        button = document.createElement('button')
        button.innerText = 'B';
        this.eGui.appendChild(button);

        button = document.createElement('button')
        button.innerText = 'C';
        this.eGui.appendChild(button);}

    getGui() {
        return this.eGui;
    }

    refresh() {
        return false
    }
}
