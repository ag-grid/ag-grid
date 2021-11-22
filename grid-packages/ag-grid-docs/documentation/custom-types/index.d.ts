// By providing this type we do not have to add a declare to every example file for the new agGrid.Grid method

// See to explain the inline imports in the type definition
// https://stackoverflow.com/questions/39040108/import-class-in-definition-file-d-ts 

declare const agGrid: {
    Grid: new (eGridDiv: Element | null, gridOptions: import("@ag-grid-community/core").GridOptions, params?: import("@ag-grid-community/core").GridParams) => import("@ag-grid-community/core").Grid
};

// Useful for extracting row data in a file called data.js with a function getData()
// and setting the rowData: getData()
declare const getData: () => any[]