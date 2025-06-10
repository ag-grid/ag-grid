import { FilterDisplayComp, FilterDisplayParams } from 'ag-grid-community';

let id = 1;

export class NumberFilterComponent implements FilterDisplayComp<any, any, number> {
    filterParams!: FilterDisplayParams<any, any, number>;
    gui!: HTMLDivElement;
    eFilterText: any;
    onFilterChanged!: () => void;

    init(params: FilterDisplayParams<any, any, number>) {
        this.setupGui();
        this.refresh(params);
    }

    private setupGui() {
        const inputId = `filterText${id++}`;
        this.gui = document.createElement('div');
        this.gui.innerHTML = `
            <div style="padding: 4px">
                <div style="font-weight: bold;">Greater than: </div>
                <div>
                    <input style="margin: 4px 0 4px 0;" type="number" min="0" id="${inputId}" placeholder="Number of medals..."/>
                </div>
            </div>
        `;

        this.onFilterChanged = () => {
            const textValue = this.eFilterText.value;
            const value = textValue === '' ? null : Number(textValue);
            this.filterParams.onModelChange(value);
        };

        this.eFilterText = this.gui.querySelector(`#${inputId}`);
        this.eFilterText.addEventListener('input', this.onFilterChanged);
    }

    getGui() {
        return this.gui;
    }

    refresh(params: FilterDisplayParams<any, any, number>) {
        this.filterParams = params;
        const currentValue = this.eFilterText.value;
        const newValue = String(params.model ?? '');
        if (newValue !== currentValue) {
            this.eFilterText.value = newValue;
        }
        return true;
    }

    destroy() {
        this.eFilterText.removeEventListener('input', this.onFilterChanged);
    }
}
