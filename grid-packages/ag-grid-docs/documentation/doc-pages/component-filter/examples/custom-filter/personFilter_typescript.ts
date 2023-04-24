import { IDoesFilterPassParams, IFilterComp, IFilterParams } from "@ag-grid-community/core";

export class PersonFilter implements IFilterComp {
    params!: IFilterParams;
    filterText!: string | null;
    gui!: HTMLDivElement;
    eFilterText: any;

    init(params: IFilterParams) {
        this.params = params;
        this.filterText = null;
        this.setupGui(params);
    }

    // not called by AG Grid, just for us to help setup
    setupGui(params: IFilterParams) {
        this.gui = document.createElement('div');
        this.gui.innerHTML =
            `<div style="padding: 4px; width: 200px;">
                <div style="font-weight: bold;">Custom Athlete Filter</div>
                <div>
                    <input style="margin: 4px 0 4px 0;" type="text" id="filterText" placeholder="Full name search..."/>
                </div>
                <div style="margin-top: 20px;">This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.</div>
                <div style="margin-top: 20px;">Just to emphasise that anything can go in here, here is an image!!</div>
                <div>
                    <img src="https://www.ag-grid.com/images/ag-Grid2-200.png" style="width: 150px; text-align: center; padding: 10px; margin: 10px; border: 1px solid lightgrey;"/>
                </div>
            </div>
        `;

        const listener = (event: any) => {
            this.filterText = event.target.value;
            params.filterChangedCallback();
        }

        this.eFilterText = this.gui.querySelector('#filterText');
        this.eFilterText.addEventListener("changed", listener);
        this.eFilterText.addEventListener("paste", listener);
        this.eFilterText.addEventListener("input", listener);
    }

    getGui() {
        return this.gui;
    }

    doesFilterPass(params: IDoesFilterPassParams) {
        const { api, colDef, column, columnApi, context } = this.params;
        const { node } = params;

        // make sure each word passes separately, ie search for firstname, lastname
        let passed = true;
        this.filterText?.toLowerCase().split(' ').forEach(filterWord => {
            const value = this.params.valueGetter({
                api,
                colDef,
                column,
                columnApi,
                context,
                data: node.data,
                getValue: (field) => node.data[field],
                node,
            });

            if (value.toString().toLowerCase().indexOf(filterWord) < 0) {
                passed = false;
            }
        });

        return passed;
    }

    isFilterActive() {
        return this.filterText != null && this.filterText !== '';
    }

    getModel() {
        if (!this.isFilterActive()) { return null; }

        return { value: this.filterText };
    }

    setModel(model: any) {
        this.eFilterText.value = model == null ? null : model.value;
    }
}

