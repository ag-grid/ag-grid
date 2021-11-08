const isNumeric = n => !isNaN(parseFloat(n)) && isFinite(n);

const getNumberFilter = () => {
    return class NumberFilter {
        constructor() {
        }

        init(params) {
            this.valueGetter = params.valueGetter;
            this.filterText = null;
            this.params = params;
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

            const that = this;
            this.onFilterChanged = function () {
                that.extractFilterText();
                that.params.filterChangedCallback();
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

        doesFilterPass(params) {
            const valueGetter = this.valueGetter;
            const value = valueGetter(params);
            const filterValue = this.filterText;

            if (this.isFilterActive()) {
                if (!value) return false;
                return Number(value) > Number(filterValue);
            }
        }

        isFilterActive() {
            return this.filterText !== null &&
                this.filterText !== undefined &&
                this.filterText !== '' &&
                isNumeric(this.filterText);
        }

        getModel() {
            return this.isFilterActive() ? Number(this.eFilterText.value) : null;
        }

        setModel(model) {
            this.eFilterText.value = model;
            this.extractFilterText();
        }

        destroy() {
            this.eFilterText.removeEventListener('input', this.onFilterChanged);
        }

        getModelAsString() {
            return this.isFilterActive() ? '>' + this.filterText : '';
        }
    }
}
const columnDefs = [
    {field: 'athlete', width: 150, filter: false},
    {field: 'gold', width: 100, filter: 'customNumberFilter', suppressMenu: true},
    {field: 'silver', width: 100, filter: 'customNumberFilter', suppressMenu: true},
    {field: 'bronze', width: 100, filter: 'customNumberFilter', suppressMenu: true},
    {field: 'total', width: 100, filter: 'customNumberFilter', suppressMenu: true}
];

const gridOptions = {
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        floatingFilter: true,
        resizable: true,
    },
    components: {
        customNumberFilter: getNumberFilter()
    },
    columnDefs: columnDefs,
    rowData: null
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => {
            gridOptions.api.setRowData(data);
        });
});
