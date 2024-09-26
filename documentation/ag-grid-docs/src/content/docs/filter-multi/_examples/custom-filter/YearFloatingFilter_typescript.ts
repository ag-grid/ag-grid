import type { IFloatingFilterComp, IFloatingFilterParams, IFloatingFilterParentCallback } from 'ag-grid-community';

import type { YearFilter } from './YearFilter_typescript';

export class YearFloatingFilter implements IFloatingFilterComp {
    parentFilterInstance!: (callback: IFloatingFilterParentCallback<YearFilter>) => void;
    eGui!: HTMLDivElement;
    rbAllYears: any;
    rbAfter2004: any;

    init(params: IFloatingFilterParams<YearFilter>) {
        this.parentFilterInstance = params.parentFilterInstance;
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<div class="year-filter">' +
            '<label>' +
            '  <input type="radio" name="yearFloatingFilter" checked="checked" id="rbFloatingYearAll" /> All' +
            '</label>' +
            '<label>' +
            '  <input type="radio" name="yearFloatingFilter" id="rbFloatingYearAfter2004" /> After 2004' +
            '</label>' +
            '</div>';

        this.rbAllYears = this.eGui.querySelector('#rbFloatingYearAll');
        this.rbAfter2004 = this.eGui.querySelector('#rbFloatingYearAfter2004');

        this.rbAllYears.addEventListener('change', this.onSelectionChanged.bind(this));
        this.rbAfter2004.addEventListener('change', this.onSelectionChanged.bind(this));
    }

    onSelectionChanged() {
        this.parentFilterInstance((instance) => {
            instance.onFloatingFilterChanged(this.rbAfter2004.checked);
        });
    }

    onParentModelChanged(parentModel: any) {
        if (parentModel) {
            this.rbAllYears.checked = false;
            this.rbAfter2004.checked = true;
        } else {
            this.rbAllYears.checked = true;
            this.rbAfter2004.checked = false;
        }
    }

    getGui() {
        return this.eGui;
    }
}
