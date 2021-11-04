const columnDefs = [
    {headerName: "Athlete", field: "athlete", suppressMenu: true},
    {headerName: "Age", field: "age", sortable: false},
    {headerName: "Country", field: "country", suppressMenu: true},
    {headerName: "Year", field: "year", sortable: false},
    {headerName: "Date", field: "date", suppressMenu: true, sortable: false},
    {headerName: "Sport", field: "sport", sortable: false},
    {headerName: "Gold", field: "gold"},
    {headerName: "Silver", field: "silver", sortable: false},
    {headerName: "Bronze", field: "bronze", suppressMenu: true},
    {headerName: "Total", field: "total", sortable: false}
];

const gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    suppressMenuHide: true,
    defaultColDef: {
        sortable: true,
        resizable: true,
        filter: true,
        width: 150,
        headerComponentParams: {
            menuIcon: 'fa-bars',
            template:
                `<div class="ag-cell-label-container" role="presentation">  
                    <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>  
                    <div ref="eLabel" class="ag-header-cell-label" role="presentation">    
                        <span ref="eSortOrder" class="ag-header-icon ag-sort-order" ></span>    
                        <span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon" ></span>    
                        <span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon" ></span>    
                        <span ref="eSortNone" class="ag-header-icon ag-sort-none-icon" ></span>    
                        ** <span ref="eText" class="ag-header-cell-text" role="columnheader"></span>    
                        <span ref="eFilter" class="ag-header-icon ag-filter-icon"></span>  
                    </div>
                </div>`
        }
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => gridOptions.api.setRowData(data));
});
