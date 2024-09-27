import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export class CellRenderer implements ICellRendererComp {
    eGui: any;
    eButton: any;
    params!: ICellRendererParams;
    buttonClickListener!: () => void;

    createGui() {
        const template =
            '<button id="theButton" style="height: 30px">✎</button><span id="theValue" style="padding-left: 4px;"></span>';
        const span = document.createElement('span');
        span.innerHTML = template;
        this.eGui = span;
    }

    init(params: ICellRendererParams) {
        // create the gui
        this.createGui();
        // keep params, we use it in onButtonClicked
        this.params = params;

        // attach the value to the value span
        const eValue = this.eGui.querySelector('#theValue');

        eValue.textContent = params.value;
        // setup the button, first get reference to it
        this.eButton = this.eGui.querySelector('#theButton');

        this.buttonClickListener = () => this.onButtonClicked();
        this.eButton.addEventListener('click', this.buttonClickListener);
    }
    onButtonClicked() {
        // start editing this cell. see the docs on the params that this method takes
        const startEditingParams = {
            rowIndex: this.params.node.rowIndex!,
            colKey: this.params.column!.getId(),
        };
        this.params.api.startEditingCell(startEditingParams);
    }
    getGui() {
        // returns our gui to the grid for this cell
        return this.eGui;
    }
    refresh() {
        return false;
    }
    destroy() {
        // be good, clean up the listener
        this.eButton.removeEventListener('click', this.buttonClickListener);
    }
}
