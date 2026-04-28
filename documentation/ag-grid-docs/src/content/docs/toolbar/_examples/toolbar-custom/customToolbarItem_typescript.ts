import type { GridApi, IToolbarItemComp, IToolbarItemParams, ToolPanelVisibleChangedEvent } from 'ag-grid-community';

export interface CustomToolbarToggleParams extends IToolbarItemParams {
    label?: string;
    title?: string;
    icon: string;
    panelId: string;
    onClick: (api: GridApi) => void;
}
export class CustomToolbarToggle implements IToolbarItemComp {
    params!: CustomToolbarToggleParams;
    eGui!: HTMLButtonElement;
    buttonListener: any;
    panelListener: any;

    init(params: CustomToolbarToggleParams) {
        this.params = params;

        const title = params.title ?? params.label ?? '';

        this.eGui = document.createElement('button');
        this.eGui.type = 'button';
        this.eGui.className = 'ag-toolbar-item ag-toolbar-button';
        this.eGui.title = title;
        this.eGui.setAttribute('aria-label', title);

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

        this.panelListener = ({ key, visible }: ToolPanelVisibleChangedEvent) => {
            if (key === params.panelId && !visible) {
                this.eGui.style.background = '';
            } else if (key === params.panelId && visible) {
                this.eGui.style.background = 'var(--ag-button-background-color)';
            } else if (visible) {
                this.eGui.style.background = '';
            }
        };
        params.api.addEventListener('toolPanelVisibleChanged', this.panelListener);
    }

    getGui() {
        return this.eGui;
    }

    destroy() {
        this.eGui.removeEventListener('click', this.buttonListener);
        this.params.api.removeEventListener('toolPanelVisibleChanged', this.panelListener);
    }
}
