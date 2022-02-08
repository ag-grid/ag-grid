import { FirstDataRenderedEvent, Grid, GridOptions, IFiltersToolPanel, } from '@ag-grid-community/core'
import { CountryCellRenderer } from './countryCellRenderer_typescript'

const COUNTRY_CODES: Record<string, string> = {
    Ireland: 'ie',
    Luxembourg: 'lu',
    Belgium: 'be',
    Spain: 'es',
    France: 'fr',
    Germany: 'de',
    Sweden: 'se',
    Italy: 'it',
    Greece: 'gr',
    Iceland: 'is',
    Portugal: 'pt',
    Malta: 'mt',
    Norway: 'no',
    Brazil: 'br',
    Argentina: 'ar',
    Colombia: 'co',
    Peru: 'pe',
    Venezuela: 've',
    Uruguay: 'uy',
};

const gridOptions: GridOptions = {
    columnDefs: [
        {
            headerName: 'No Cell Renderer',
            field: 'country',
            cellRenderer: CountryCellRenderer,
            filter: 'agSetColumnFilter',
            filterParams: {
                // no cell renderer!
            },
        },
        {
            headerName: 'With Cell Renderers',
            field: 'country',
            cellRenderer: CountryCellRenderer,
            filter: 'agSetColumnFilter',
            filterParams: {
                cellRenderer: CountryCellRenderer,
            },
        },
    ],
    context: {
        COUNTRY_CODES: COUNTRY_CODES
    },
    defaultColDef: {
        flex: 1,
        minWidth: 225,
        resizable: true,
        floatingFilter: true,
    },
    sideBar: 'filters',
    onFirstDataRendered: onFirstDataRendered,
}

function printFilterModel() {
    const filterModel = gridOptions.api!.getFilterModel();
    console.log(filterModel)
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    ((params.api.getToolPanelInstance(
        'filters'
    ) as any) as IFiltersToolPanel).expandFilters()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    new Grid(gridDiv, gridOptions)

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(function (data) {
            // only return data that has corresponding country codes
            const dataWithFlags = data.filter(function (d: any) {
                return COUNTRY_CODES[d.country]
            });

            gridOptions.api!.setRowData(dataWithFlags)
        })
})

