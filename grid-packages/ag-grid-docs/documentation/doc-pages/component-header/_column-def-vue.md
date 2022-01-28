[[only-vue]]
|```js
|// a list of column definitions
|this.columnDefs = [
|
|    // these columns use the default header
|    {headerName: "Athlete", field: "athlete"},
|    {headerName: "Sport", field: "sport"},
|
|    // this column uses a custom header
|    // component specified in frameworkComponents
|    {headerName: "Age", field: "age", headerComponentFramework: 'myHeaderComponent'},
|
|    // you can also specify header components for groups
|    {
|        headerName: "Medals",
|        // custom header component
|        // component specified in frameworkComponents
|        headerGroupComponentFramework: 'myHeaderGroupComp',
|        children: [
|            {headerName: "Gold", field: "gold"},
|            {headerName: "Silver", field: "silver"},
|            {headerName: "Gold", field: "bronze"}
|        ]
|    }
|}]
|```

