import type { FilterChangedEvent, IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';

const COLUMNS = [
    { column: 'gold', label: 'Gold winners only' },
    { column: 'silver', label: 'Silver winners only' },
];

export class WinnersToggle implements IToolbarItemComp {
    private params!: IToolbarItemParams;
    eGui!: HTMLDivElement;
    private inputs: Record<string, HTMLInputElement> = {};
    private changeListener!: (event: Event) => void;
    private filterListener!: (event: FilterChangedEvent) => void;

    init(params: IToolbarItemParams) {
        this.params = params;

        this.eGui = document.createElement('div');
        this.eGui.className = 'ag-toolbar-item';
        this.eGui.style.cssText = 'display: flex; gap: 12px; padding: 8px;';

        for (const { column, label } of COLUMNS) {
            const eLabel = document.createElement('label');
            eLabel.style.cssText = 'display: inline-flex; align-items: center; gap: 4px; padding: 0 4px;';

            const eInput = document.createElement('input');
            eInput.type = 'checkbox';
            eInput.dataset.column = column;
            eInput.style.margin = '0';

            eLabel.appendChild(eInput);
            eLabel.appendChild(document.createTextNode(label));
            this.eGui.appendChild(eLabel);
            this.inputs[column] = eInput;
        }

        this.changeListener = (event: Event) => {
            const target = event.target as HTMLInputElement;
            const column = target.dataset.column!;
            const model = target.checked ? { type: 'greaterThan', filter: 0 } : null;
            params.api.setColumnFilterModel(column, model).then(() => params.api.onFilterChanged());
        };
        this.eGui.addEventListener('change', this.changeListener);

        this.filterListener = () => {
            for (const { column } of COLUMNS) {
                this.inputs[column].checked = params.api.getColumnFilterModel(column) != null;
            }
        };
        params.api.addEventListener('filterChanged', this.filterListener);
    }

    getGui() {
        return this.eGui;
    }

    destroy() {
        this.eGui.removeEventListener('change', this.changeListener);
        this.params.api.removeEventListener('filterChanged', this.filterListener);
    }
}

const PANELS = [
    { value: 'filters', label: 'Filters' },
    { value: 'columns', label: 'Columns' },
    { value: 'none', label: 'None' },
];

export class ToolPanelRadio implements IToolbarItemComp {
    eGui!: HTMLDivElement;
    private params!: IToolbarItemParams;
    private inputs: Record<string, HTMLInputElement> = {};
    private changeListener!: (event: Event) => void;

    init(params: IToolbarItemParams) {
        this.params = params;

        this.eGui = document.createElement('div');
        this.eGui.className = 'ag-toolbar-item';
        this.eGui.setAttribute('role', 'radiogroup');
        this.eGui.style.cssText = 'display: flex; gap: 12px; padding: 10px; align-items: center;';

        const eGroupLabel = document.createElement('span');
        eGroupLabel.textContent = 'Tool Panel:';
        eGroupLabel.style.fontWeight = '500';
        this.eGui.appendChild(eGroupLabel);

        const groupName = `tool-panel-${params.key}`;
        for (const { value, label } of PANELS) {
            const eLabel = document.createElement('label');
            eLabel.style.cssText = 'display: inline-flex; align-items: center; gap: 4px; padding: 0 4px;';

            const eInput = document.createElement('input');
            eInput.type = 'radio';
            eInput.name = groupName;
            eInput.value = value;
            eInput.checked = value === 'none';
            eInput.style.margin = '0';

            eLabel.appendChild(eInput);
            eLabel.appendChild(document.createTextNode(label));
            this.eGui.appendChild(eLabel);
            this.inputs[value] = eInput;
        }

        this.changeListener = (event: Event) => {
            const value = (event.target as HTMLInputElement).value;
            if (value === 'none') {
                params.api.closeToolPanel();
            } else {
                params.api.openToolPanel(value);
            }
        };
        this.eGui.addEventListener('change', this.changeListener);
    }

    // Public method, called externally via api.getToolbarItemInstance(key) when a tool panel
    // is opened or closed by anything other than this component.
    setSelected(value: string) {
        const target = this.inputs[value] ?? this.inputs['none'];
        if (target && !target.checked) {
            target.checked = true;
        }
    }

    getGui() {
        return this.eGui;
    }

    destroy() {
        this.eGui.removeEventListener('change', this.changeListener);
    }
}
