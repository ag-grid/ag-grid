import { IDoesFilterPassParams, IFilterComp, IFilterParams } from "@ag-grid-community/core";

export class PersonFilter implements IFilterComp {
    params!: IFilterParams;
    filterText!: string | null;
    gui!: HTMLDivElement;
    eFilterText: any;

    init(params: IFilterParams) {
        this.params = params;
        this.filterText = null
        this.setupGui(params)
    }

    // not called by AG Grid, just for us to help setup
    setupGui(params: IFilterParams) {
        this.gui = document.createElement('div')
        this.gui.innerHTML =
            '<div style="padding: 4px;">' +
            '<div style="font-weight: bold;">Custom Athlete Filter</div>' +
            '<div><input style="margin: 4px 0px 4px 0px;" type="text" id="filterText" placeholder="Full name search..."/></div>' +
            '<div style="margin-top: 20px; width: 200px;">This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.</div>' +
            '<div style="margin-top: 20px; width: 200px;">Just to iterate anything can go in here, here is an image:</div>' +
            '<div><img src="images/ag-Grid2-200.png" style="width: 150px; text-align: center; padding: 10px; margin: 10px; border: 1px solid lightgrey;"/></div>' +
            '</div>'
        const listener = (event: any) => {
            this.filterText = event.target.value
            params.filterChangedCallback()
        }

        this.eFilterText = this.gui.querySelector('#filterText')
        this.eFilterText.addEventListener('changed', listener)
        this.eFilterText.addEventListener('paste', listener)
        this.eFilterText.addEventListener('input', listener)

    }

    getGui() {
        return this.gui
    }

    doesFilterPass(params: IDoesFilterPassParams) {
        const { api, colDef, column, columnApi, context } = this.params;
        const { node } = params;

        const value = this.params.valueGetter({
            api,
            colDef,
            column,
            columnApi,
            context,
            data: node.data,
            getValue: (field) => node.data[field],
            node,
        }).toString().toLowerCase();

        // make sure each word passes separately, ie search for firstname, lastname
        return this.filterText!
            .toLowerCase()
            .split(' ')
            .every((filterWord) => {
                return value.indexOf(filterWord) >= 0;
            });
    }

    isFilterActive() {
        var isActive =
            this.filterText !== null &&
            this.filterText !== undefined &&
            this.filterText !== ''
        return isActive
    }

    getApi() {
        return {
            getModel: () => {
                return { value: this.eFilterText.value }
            },
            setModel: (model: any) => {
                this.eFilterText.value = model.value
            },
        }
    }

    // lazy, the example doesn't use getModel() and setModel()
    getModel() {
    }

    setModel() {
    }
}

