import type { IToolbarItemComp, IToolbarItemParams, ToolPanelVisibleChangedEvent } from 'ag-grid-community';

interface PanelToggleParams {
    label: string;
    icon: string;
    panelId: string;
}

export class CustomPanelToggle implements IToolbarItemComp {
    private params!: IToolbarItemParams<any, any, PanelToggleParams>;
    private active = false;
    eGui!: HTMLButtonElement;
    private buttonListener!: () => void;
    private panelListener!: (event: ToolPanelVisibleChangedEvent) => void;

    init(params: IToolbarItemParams<any, any, PanelToggleParams>) {
        this.params = params;
        const { label, icon } = params.toolbarItemParams!;

        this.eGui = document.createElement('button');
        this.eGui.type = 'button';
        this.eGui.className = 'ag-toolbar-item ag-toolbar-button';
        this.eGui.title = label;
        this.eGui.setAttribute('aria-label', label);

        const eIcon = document.createElement('span');
        eIcon.className = `ag-icon ag-icon-${icon}`;
        eIcon.setAttribute('aria-hidden', 'true');
        this.eGui.appendChild(eIcon);

        const eLabel = document.createElement('span');
        eLabel.textContent = label;
        this.eGui.appendChild(eLabel);

        this.buttonListener = () => this.toggle();
        this.eGui.addEventListener('click', this.buttonListener);

        this.panelListener = ({ key, visible }: ToolPanelVisibleChangedEvent) => {
            const { panelId } = this.params.toolbarItemParams!;
            if (key === panelId) {
                this.setActive(visible);
            } else if (visible) {
                this.setActive(false);
            }
        };
        params.api.addEventListener('toolPanelVisibleChanged', this.panelListener);
    }

    // Public method, accessible via api.getToolbarItemInstance(key).
    public toggle() {
        const { panelId } = this.params.toolbarItemParams!;
        if (this.params.api.getOpenedToolPanel() === panelId) {
            this.params.api.closeToolPanel();
        } else {
            this.params.api.openToolPanel(panelId);
        }
    }

    private setActive(active: boolean) {
        this.active = active;
        this.eGui.style.backgroundColor = active ? 'var(--ag-button-background-color)' : '';
    }

    getGui() {
        return this.eGui;
    }

    destroy() {
        this.eGui.removeEventListener('click', this.buttonListener);
        this.params.api.removeEventListener('toolPanelVisibleChanged', this.panelListener);
    }
}
