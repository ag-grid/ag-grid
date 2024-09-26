import type { IAfterGuiAttachedParams, IDoesFilterPassParams, IFilterComp, IFilterParams } from 'ag-grid-community';

export class YearFilter implements IFilterComp {
    eGui!: HTMLDivElement;
    rbAllYears: any;
    rbAfter2004: any;
    filterActive!: boolean;
    filterChangedCallback: any;

    init(params: IFilterParams) {
        this.filterChangedCallback = params.filterChangedCallback.bind(this);
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="year-filter">' +
            '<label>' +
            '  <input type="radio" name="yearFilter" checked="checked" id="rbYearAll" /> All' +
            '</label>' +
            '<label>' +
            '  <input type="radio" name="yearFilter" id="rbYearAfter2004" /> After 2004' +
            '</label>' +
            '</div>';

        this.rbAllYears = this.eGui.querySelector('#rbYearAll');
        this.rbAllYears.addEventListener('change', this.filterChangedCallback);
        this.rbAfter2004 = this.eGui.querySelector('#rbYearAfter2004');
        this.rbAfter2004.addEventListener('change', this.filterChangedCallback);
        this.filterActive = false;
    }

    getGui() {
        return this.eGui;
    }

    doesFilterPass(params: IDoesFilterPassParams) {
        return params.data.year > 2004;
    }

    isFilterActive() {
        return this.rbAfter2004.checked;
    }

    getModel() {
        return this.isFilterActive() || null;
    }

    onFloatingFilterChanged(value: any) {
        this.setModel(value);
        this.filterChangedCallback();
    }

    setModel(model: any) {
        if (model) {
            this.rbAllYears.checked = false;
            this.rbAfter2004.checked = true;
        } else {
            this.rbAllYears.checked = true;
            this.rbAfter2004.checked = false;
        }
    }

    afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        if (!params?.suppressFocus) {
            this.rbAllYears.focus();
        }
    }
}
