import type { IDoesFilterPassParams, IFilterComp, IFilterParams } from 'ag-grid-community';

export class PersonFilter implements IFilterComp {
    filterParams!: IFilterParams;
    filterText!: string | null;
    gui!: HTMLDivElement;
    eFilterText: any;

    init(params: IFilterParams) {
        this.filterParams = params;
        this.filterText = null;
        this.setupGui(params);
    }

    // not called by AG Grid, just for us to help setup
    setupGui(params: IFilterParams) {
        this.gui = document.createElement('div');
        this.gui.innerHTML =
            '<div style="padding: 12px;">' +
            '<div style="font-weight: bold;">Custom Athlete Filter</div>' +
            '<div><input style="margin: 4px 0px 4px 0px;" type="text" id="filterText" placeholder="Full name search..."/></div>' +
            '<div style="margin-top: 20px; width: 200px;">This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.</div>' +
            '<div style="margin-top: 20px; width: 200px;">Just to iterate anything can go in here, here is an image:</div>' +
            '<div><img src="https://www.ag-grid.com/example-assets/ag-grid-logo.png" style="width: 150px; text-align: center; padding: 10px; margin: 10px; border: 1px solid lightgrey; background-color: white;"/></div>' +
            '</div>';
        const listener = (event: any) => {
            this.filterText = event.target.value;
            params.filterChangedCallback();
        };

        this.eFilterText = this.gui.querySelector('#filterText');
        this.eFilterText.addEventListener('changed', listener);
        this.eFilterText.addEventListener('paste', listener);
        this.eFilterText.addEventListener('input', listener);
    }

    getGui() {
        return this.gui;
    }

    doesFilterPass(params: IDoesFilterPassParams) {
        const { node } = params;

        const value = this.filterParams.getValue(node).toString().toLowerCase();

        // make sure each word passes separately, ie search for firstname, lastname
        return this.filterText!.toLowerCase()
            .split(' ')
            .every((filterWord) => {
                return value.indexOf(filterWord) >= 0;
            });
    }

    isFilterActive() {
        const isActive = this.filterText !== null && this.filterText !== undefined && this.filterText !== '';
        return isActive;
    }

    getApi() {
        return {
            getModel: () => {
                return { value: this.eFilterText.value };
            },
            setModel: (model: any) => {
                this.eFilterText.value = model.value;
            },
        };
    }

    // lazy, the example doesn't use getModel() and setModel()
    getModel() {}

    setModel() {}
}
