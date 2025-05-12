import type { IStatusPanelComp, IStatusPanelParams } from 'ag-grid-community';

export class ClickableStatusBarComponent implements IStatusPanelComp {
    params!: IStatusPanelParams;
    eGui!: HTMLDivElement;
    eButton!: HTMLButtonElement;
    eCounter!: HTMLSpanElement;
    buttonListener: any;
    clickCount: number = 0;

    init(params: IStatusPanelParams) {
        this.params = params;

        this.eGui = document.createElement('div');
        this.eGui.className = 'ag-status-name-value';

        const label = document.createElement('span');
        label.textContent = 'Status Bar Component ';
        this.eGui.appendChild(label);

        this.eButton = document.createElement('button');

        this.buttonListener = this.onButtonClicked.bind(this);
        this.eButton.addEventListener('click', this.buttonListener);
        this.eButton.textContent = 'Click Me';

        this.eCounter = document.createElement('span');

        this.eGui.appendChild(this.eButton);
        this.eGui.appendChild(this.eCounter);
    }

    getGui() {
        return this.eGui;
    }

    destroy() {
        this.eButton.removeEventListener('click', this.buttonListener);
    }

    onButtonClicked() {
        this.eCounter.textContent = ` ${this.params.api.getSelectedRows().length} selected`;
    }
}
