import type { GridApi, IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';

export interface CustomToolbarButtonParams extends IToolbarItemParams {
    label: string;
    icon: string;
    onClick: (api: GridApi) => void;
}

export class CustomToolbarButton implements IToolbarItemComp {
    params!: CustomToolbarButtonParams;
    eGui!: HTMLButtonElement;
    buttonListener: any;

    init(params: CustomToolbarButtonParams) {
        this.params = params;

        this.eGui = document.createElement('button');
        this.eGui.type = 'button';
        this.eGui.className = 'ag-toolbar-item ag-toolbar-button';
        this.eGui.title = params.label;
        this.eGui.setAttribute('aria-label', params.label);

        const eIcon = document.createElement('span');
        eIcon.className = `ag-icon ag-icon-${params.icon}`;
        eIcon.setAttribute('aria-hidden', 'true');
        this.eGui.appendChild(eIcon);

        if (params.label) {
            const eLabel = document.createElement('span');
            eLabel.textContent = params.label;
            this.eGui.appendChild(eLabel);
        }

        this.buttonListener = () => this.params.onClick(this.params.api);
        this.eGui.addEventListener('click', this.buttonListener);
    }

    getGui() {
        return this.eGui;
    }

    destroy() {
        this.eGui.removeEventListener('click', this.buttonListener);
    }
}
