import type { IToolbarItemComp, IToolbarItemParams, ToolPanelVisibleChangedEvent } from 'ag-grid-community';

const OPTIONS = [
    { value: 'filters-new', label: 'Filters' },
    { value: 'columns', label: 'Columns' },
    { value: 'none', label: 'None' },
] as const;

export class ToolPanelRadio implements IToolbarItemComp {
    private params!: IToolbarItemParams;
    private inputs: Record<string, HTMLInputElement> = {};
    eGui!: HTMLElement;
    private changeListener!: (event: Event) => void;
    private panelListener!: (event: ToolPanelVisibleChangedEvent) => void;

    init(params: IToolbarItemParams) {
        this.params = params;

        this.eGui = document.createElement('div');
        this.eGui.className = 'ag-toolbar-item';
        this.eGui.setAttribute('role', 'radiogroup');
        this.eGui.setAttribute('aria-label', 'Tool panel');

        const groupName = `tool-panel-${params.key}`;
        for (const option of OPTIONS) {
            const eLabel = document.createElement('label');
            eLabel.style.marginRight = '8px';

            const eInput = document.createElement('input');
            eInput.type = 'radio';
            eInput.name = groupName;
            eInput.value = option.value;
            eInput.style.marginRight = '4px';

            eLabel.appendChild(eInput);
            eLabel.appendChild(document.createTextNode(option.label));
            this.eGui.appendChild(eLabel);
            this.inputs[option.value] = eInput;
        }

        this.setSelected('none');

        this.changeListener = (event: Event) => {
            const value = (event.target as HTMLInputElement).value;
            if (value === 'none') {
                this.params.api.closeToolPanel();
            } else {
                this.params.api.openToolPanel(value);
            }
        };
        this.eGui.addEventListener('change', this.changeListener);

        this.panelListener = ({ key, visible }: ToolPanelVisibleChangedEvent) => {
            if (visible) {
                this.setSelected(key);
            } else if (this.inputs[key]?.checked) {
                this.setSelected('none');
            }
        };
        params.api.addEventListener('toolPanelVisibleChanged', this.panelListener);
    }

    private setSelected(value: string) {
        for (const option of OPTIONS) {
            this.inputs[option.value].checked = option.value === value;
        }
    }

    getGui() {
        return this.eGui;
    }

    destroy() {
        this.eGui.removeEventListener('change', this.changeListener);
        this.params.api.removeEventListener('toolPanelVisibleChanged', this.panelListener);
    }
}
