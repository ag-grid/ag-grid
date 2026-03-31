import type { IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';

export class CustomToolbarItem implements IToolbarItemComp {
    params!: IToolbarItemParams;
    eGui!: HTMLDivElement;
    eButton!: HTMLButtonElement;
    buttonListener: any;

    init(params: IToolbarItemParams) {
        this.params = params;

        this.eGui = document.createElement('div');
        this.eGui.className = 'ag-toolbar-item';

        this.eButton = document.createElement('button');
        this.eButton.className = 'ag-button ag-standard-button';
        this.eButton.textContent = 'Log Selected Rows';

        this.buttonListener = this.onButtonClicked.bind(this);
        this.eButton.addEventListener('click', this.buttonListener);

        this.eGui.appendChild(this.eButton);
    }

    getGui() {
        return this.eGui;
    }

    destroy() {
        this.eButton.removeEventListener('click', this.buttonListener);
    }

    onButtonClicked() {
        const selectedRows = this.params.api.getSelectedRows();
        console.log('Selected Rows:', selectedRows.length);
    }
}
