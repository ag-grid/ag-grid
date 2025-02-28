import type { IStatusPanelComp, IStatusPanelParams } from 'ag-grid-community';

export class CountStatusBarComponent implements IStatusPanelComp {
    params!: IStatusPanelParams;
    eGui!: HTMLDivElement;
    eCount!: HTMLSpanElement;

    init(params: IStatusPanelParams) {
        this.params = params;

        this.eGui = document.createElement('div');
        this.eGui.className = 'ag-status-name-value';

        const label = document.createElement('span');
        label.textContent = 'Row Count Component: ';
        this.eGui.appendChild(label);

        this.eCount = document.createElement('span');
        this.eCount.className = 'ag-status-name-value-value';

        this.eGui.appendChild(this.eCount);

        params.api.addEventListener('rowDataUpdated', this.onRowDataUpdated.bind(this));
    }

    getGui() {
        return this.eGui;
    }

    destroy() {
        if (!this.params.api.isDestroyed()) {
            this.params.api.removeEventListener('rowDataUpdated', this.onRowDataUpdated);
        }
    }

    onRowDataUpdated() {
        this.eCount.textContent = this.params.api.getDisplayedRowCount() + '';
    }
}
