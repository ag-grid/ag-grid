export class PersonFilter {
    init(params) {
        this.filterText = null;
        this.params = params;
        this.setupGui();
    }

    // not called by AG Grid, just for us to help setup
    setupGui() {
        this.gui = document.createElement('div');
        this.gui.innerHTML =
            `<div style="padding: 4px;">
                <div style="font-weight: bold;">Custom Athlete Filter</div>
                <div class="ag-input-wrapper">
                    <input style="margin: 4px 0 4px 0;" type="text" id="filterText" aria-label="Full name search" placeholder="Full name search..."/>
                </div>
                <div style="margin-top: 20px; width: 200px;">This filter does partial word search on multiple words, e.g. "mich phel" still brings back Michael Phelps.</div>
                <div style="margin-top: 20px; width: 200px;">Just to illustrate that anything can go in here, here is an image:</div>
                <div>
                    <img src="../images/ag-Grid2-200.png" alt="ag-grid" style="width: 150px; text-align: center; padding: 10px; margin: 10px; border: 1px solid lightgrey;"/>
                </div>
            </div>`;

        this.eFilterText = this.gui.querySelector('#filterText');
        this.eFilterText.addEventListener("input", this.onFilterChanged.bind(this));
    }

    setFromFloatingFilter(filter) {
        this.eFilterText.value = filter;
        this.onFilterChanged();
    }

    onFilterChanged() {
        this.extractFilterText();
        this.params.filterChangedCallback();
    }

    extractFilterText() {
        this.filterText = this.eFilterText.value;
    }

    getGui() {
        return this.gui;
    }

    doesFilterPass(params) {
        const {api, colDef, column, columnApi, context} = this.params;
        const {node} = params;

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
        return this.filterText
            .toLowerCase()
            .split(' ')
            .every(filterWord => value.indexOf(filterWord) >= 0);
    }

    isFilterActive() {
        const isActive = this.filterText !== null && this.filterText !== undefined && this.filterText !== '';
        return isActive;
    }

    getModelAsString(model) {
        return model ? model : '';
    }

    getModel() {
        return this.eFilterText.value;
    }

// lazy, the example doesn't use setModel()
    setModel(model) {
        this.eFilterText.value = model;
        this.extractFilterText();
    }

    destroy() {
        this.eFilterText.removeEventListener("input", this.onFilterChanged);
    }
}
