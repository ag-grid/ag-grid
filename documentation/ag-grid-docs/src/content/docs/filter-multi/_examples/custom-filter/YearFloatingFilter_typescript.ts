import type { FloatingFilterDisplayComp, FloatingFilterDisplayParams } from 'ag-grid-community';

export class YearFloatingFilter implements FloatingFilterDisplayComp<any, any, boolean> {
    eGui!: HTMLDivElement;
    rbAllYears: any;
    rbAfter2010: any;
    params!: FloatingFilterDisplayParams<any, any, boolean>;

    init(params: FloatingFilterDisplayParams<any, any, boolean>) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="year-filter">' +
            '<label>' +
            '  <input type="radio" name="yearFloatingFilter" checked="checked" id="rbFloatingYearAll" /> All' +
            '</label>' +
            '<label>' +
            '  <input type="radio" name="yearFloatingFilter" id="rbFloatingYearAfter2010" /> After 2010' +
            '</label>' +
            '</div>';

        this.rbAllYears = this.eGui.querySelector('#rbFloatingYearAll');
        this.rbAfter2010 = this.eGui.querySelector('#rbFloatingYearAfter2010');

        this.refresh(params);

        this.rbAllYears.addEventListener('change', this.onSelectionChanged.bind(this));
        this.rbAfter2010.addEventListener('change', this.onSelectionChanged.bind(this));
    }

    refresh(params: FloatingFilterDisplayParams<any, any, boolean>) {
        this.params = params;
        if (params.source !== 'ui') {
            (params.model ? this.rbAfter2010 : this.rbAllYears).checked = true;
        }
    }

    onSelectionChanged() {
        this.params.onModelChange(this.rbAfter2010.checked || null);
    }

    getGui() {
        return this.eGui;
    }
}
