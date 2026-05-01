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
            eLabel.style.padding = '0 4px';

            const eInput = document.createElement('input');
            eInput.type = 'checkbox';
            eInput.dataset.column = column;
            eInput.style.marginRight = '4px';

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
