[[only-react]]
|## Cell Renderer Component
|
|When a React component is instantiated the grid will make the grid APIs, a number of utility methods as well as the cell &
|row values available to you via `props`.  
|
|The interface for values available on both the initial `props` value, as well as on futures `props` updates or subsequent `refresh` calls
|(see below for details on `refresh`) are as follows:
|
|```ts
|interface ICellRendererParams {
|    value: any, // value to be rendered
|    valueFormatted: any, // value to be rendered formatted
|    getValue: () => any, // convenience function to get most recent up to date value
|    setValue: (value: any) => void, // convenience to set the value
|    formatValue: (value: any) => any, // convenience to format a value using the column's formatter
|    data: any, // the row's data
|    node: RowNode, // row node
|    colDef: ColDef, // the cell's column definition
|    column: Column, // the cell's column
|    rowIndex: number, // the current index of the row (this changes after filter and sort)
|    api: GridApi, // the grid API
|    eGridCell: HTMLElement, // the grid's cell, a DOM div element
|    eParentOfValue: HTMLElement, // the parent DOM item for the cell renderer, same as eGridCell unless using checkbox selection
|    columnApi: ColumnApi, // grid column API
|    context: any, // the grid's context
|    refreshCell: () => void // convenience function to refresh the cell
|}
|```
