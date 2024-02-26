<framework-specific-section frameworks="javascript,angular,react">
<snippet transform={false}>
|// a list of column definitions
|const colDefs = [{
|
|    // no Header Comp specified, uses the Provided Header Comp
|    {headerName: "Athlete", field: "athlete"},
|    {headerName: "Sport", field: "sport"},
|
|    // uses Custom Header Comp
|    {headerName: "Age", field: "age", headerComponent: MyHeaderComponent}
|}]
</snippet>
</framework-specific-section>