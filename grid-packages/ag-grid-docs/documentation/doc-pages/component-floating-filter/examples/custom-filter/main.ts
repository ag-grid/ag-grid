import {
    GridApi,
    createGrid,
    ColDef,
    GridOptions,
    IDoesFilterPassParams,
    IFilterComp,
    IFilterParams,
} from '@ag-grid-community/core';

const isNumeric = (n: string) =>
    !isNaN(parseFloat(n)) && isFinite(parseFloat(n))

class NumberFilter implements IFilterComp {
    filterParams!: IFilterParams;
    filterText: string | null = null
    eFilterText: any
    params!: IFilterParams
    gui: any
    onFilterChanged!: () => void

    init(params: IFilterParams) {
        this.filterParams = params;
        this.filterText = null
        this.params = params
        this.setupGui()
    }

    // not called by AG Grid, just for us to help setup
    setupGui() {
        this.gui = document.createElement('div')
        this.gui.innerHTML =
            '<div style="padding: 4px;">' +
            '<div style="font-weight: bold;">Greater than: </div>' +
        '<div><input style="margin: 4px 0px 4px 0px;" type="number" id="filterText" min="0" placeholder="Number of medals..."/></div>' +
            '</div>'

        this.onFilterChanged = () => {
            this.extractFilterText()
            this.params.filterChangedCallback()
        }

        this.eFilterText = this.gui.querySelector('#filterText')
        this.eFilterText.addEventListener('input', this.onFilterChanged)
    }

    extractFilterText() {
        this.filterText = this.eFilterText.value
    }

    getGui() {
        return this.gui
    }

    doesFilterPass(params: IDoesFilterPassParams) {
        if (!this.isFilterActive()) {
            return false;
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
            isNumeric(this.filterText)
        )
    }

    getModel() {
        return this.isFilterActive() ? Number(this.eFilterText.value) : null
    }

    setModel(model: any) {
        this.eFilterText.value = model
        this.extractFilterText()
    }

    destroy() {
        this.eFilterText.removeEventListener('input', this.onFilterChanged)
    }

    getModelAsString() {
        return this.isFilterActive() ? '>' + this.filterText : ''
    }
}

const columnDefs: ColDef[] = [
    { field: 'athlete', width: 150, filter: false },
    {
        field: 'gold',
        width: 100,
        filter: NumberFilter,
        suppressMenu: true,
    },
    {
        field: 'silver',
        width: 100,
        filter: NumberFilter,
        suppressMenu: true,
    },
    {
        field: 'bronze',
        width: 100,
        filter: NumberFilter,
        suppressMenu: true,
    },
    {
        field: 'total',
        width: 100,
        filter: NumberFilter,
        suppressMenu: true,
    },
]

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        floatingFilter: true,
    },
    columnDefs: columnDefs,
    rowData: null,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => {
            gridApi!.setGridOption('rowData', data)
        })
})
