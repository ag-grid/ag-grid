import type { GridApi, IToolbarItemComp, IToolbarItemParams, ToolPanelVisibleChangedEvent } from 'ag-grid-community';

export class CustomToolbarToggle implements IToolbarItemComp {
    private params!: IToolbarItemParams;
    eGui!: HTMLButtonElement;
    buttonListener: any;
    panelListener: any;

    init(params: IToolbarItemParams) {
        this.params = params;
        const { label, title, icon, panelId, onClick } = params.toolbarItemParams;

        const tooltip = title ?? label ?? '';

        this.eGui = document.createElement('button');
        this.eGui.type = 'button';
        this.eGui.className = 'ag-toolbar-item ag-toolbar-button';
        this.eGui.title = tooltip;
        this.eGui.setAttribute('aria-label', tooltip);

        const eIcon = document.createElement('span');
        eIcon.className = `ag-icon ag-icon-${icon}`;
        eIcon.setAttribute('aria-hidden', 'true');
        this.eGui.appendChild(eIcon);

        if (label) {
            const eLabel = document.createElement('span');
            eLabel.textContent = label;
            this.eGui.appendChild(eLabel);
        }

        this.buttonListener = () => onClick(this.params.api);
        this.eGui.addEventListener('click', this.buttonListener);

        this.panelListener = ({ key, visible }: ToolPanelVisibleChangedEvent) => {
            if (key === panelId && !visible) {
                this.eGui.style.background = '';
            } else if (key === panelId && visible) {
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
