import type { IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';

export class CustomToolbarItem implements IToolbarItemComp {
    params!: IToolbarItemParams;
    eGui!: HTMLDivElement;
    eButton!: HTMLButtonElement;
    buttonListener: any;
    active = false;

    init(params: IToolbarItemParams) {
        this.params = params;

        this.eGui = document.createElement('div');
        this.eGui.className = 'ag-toolbar-item';

        this.eButton = document.createElement('button');
        this.eButton.className = 'ag-button ag-standard-button';
        this.eButton.textContent = 'Analyse by Country';

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
        const { api } = this.params;
        this.active = !this.active;

        if (this.active) {
            api.setRowGroupColumns(['country']);
            api.setFilterModel({ year: { filterType: 'number', type: 'equals', filter: 2008 } });
            this.eButton.textContent = 'Clear Analysis';
        } else {
            api.setRowGroupColumns([]);
            api.setFilterModel(null);
            this.eButton.textContent = 'Analyse by Country';
        }
    }
}
