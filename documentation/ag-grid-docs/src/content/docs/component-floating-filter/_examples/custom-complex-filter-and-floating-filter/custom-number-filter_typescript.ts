import type { IDoesFilterPassParams, IFilterComp, IFilterParams } from 'ag-grid-community';

export class CustomNumberFilter implements IFilterComp {
    filterText!: string | null;
    filterParams!: IFilterParams;
    gui!: HTMLDivElement;
    eFilterText: any;
    onFilterChanged!: () => void;

    init(params: IFilterParams) {
        this.filterText = null;
        this.filterParams = params;
        this.setupGui();
    }

    // not called by AG Grid, just for us to help setup
    setupGui() {
        this.gui = document.createElement('div');
        this.gui.innerHTML =
            '<div style="padding: 4px;">' +
            '<div style="font-weight: bold;">Greater than: </div>' +
            '<div><input style="margin: 4px 0px 4px 0px;" type="number" id="filterText" placeholder="Number of medals..."/></div>' +
            '</div>';

        this.onFilterChanged = () => {
            this.extractFilterText();
            this.filterParams.filterChangedCallback();
        };

        this.eFilterText = this.gui.querySelector('#filterText');
        this.eFilterText.addEventListener('input', this.onFilterChanged);
    }

    extractFilterText() {
        this.filterText = this.eFilterText.value;
    }

    getGui() {
        return this.gui;
    }

    doesFilterPass(params: IDoesFilterPassParams) {
        if (!this.isFilterActive()) {
            return true;
        }

        const { node } = params;

        const value = this.filterParams.getValue(node);

        const filterValue = this.filterText;

        if (value == null) return false;
        return Number(value) > Number(filterValue);
    }

    isFilterActive() {
        return (
            this.filterText !== null &&
            this.filterText !== undefined &&
            this.filterText !== '' &&
            this.isNumeric(this.filterText)
        );
    }

    isNumeric(n: string) {
        return !isNaN(parseFloat(n)) && isFinite(parseFloat(n));
    }

    getModel() {
        return this.isFilterActive() ? Number(this.eFilterText.value) : null;
    }

    setModel(model: any) {
        this.eFilterText.value = model;
        this.extractFilterText();
    }

    myMethodForTakingValueFromFloatingFilter(value: any) {
        this.eFilterText.value = value;
        this.onFilterChanged();
    }

    destroy() {
        this.eFilterText.removeEventListener('input', this.onFilterChanged);
    }
}
