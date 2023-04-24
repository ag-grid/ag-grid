import { IStatusPanelComp, IStatusPanelParams } from "@ag-grid-community/core";

export class CountStatusBarComponent implements IStatusPanelComp {
    params!: IStatusPanelParams;
    eGui!: HTMLDivElement;
    eCount!: HTMLSpanElement;

    init(params: IStatusPanelParams) {
        this.params = params;

        this.eGui = document.createElement('div');
        this.eGui.className = 'ag-status-name-value';

        var label = document.createElement('span');
        label.innerText = 'Row Count Component: ';
        this.eGui.appendChild(label);

        this.eCount = document.createElement('span');
        this.eCount.className = 'ag-status-name-value-value';

        this.eGui.appendChild(this.eCount);

        params.api.addEventListener('gridReady', this.onGridReady.bind(this));
    }

    getGui() {
        return this.eGui;
    }

    destroy() {
        this.params.api.removeEventListener("gridReady", this.onGridReady);
    }

    onGridReady() {
        this.eCount.innerText = this.params.api.getModel().getRowCount() + ''
    }
}


