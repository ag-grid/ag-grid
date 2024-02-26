<framework-specific-section frameworks="vue">
<snippet transform={false}>
|// a list of column definitions
|this.columnDefs = [
|
|    // no Header Comp specified, uses the Provided Header Comp
|    {headerName: "Athlete", field: "athlete"},
|    {headerName: "Sport", field: "sport"},
|
|    // uses Custom Header Comp
|    {headerName: "Age", field: "age", headerComponent: 'myHeaderComponent'}
|]
</snippet>
</framework-specific-section>