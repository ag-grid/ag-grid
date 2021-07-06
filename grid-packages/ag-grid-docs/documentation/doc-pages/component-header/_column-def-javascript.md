[[only-javascript]]
|```js
|// a list of column definitions
|const myColumns = [{
|
|    // these columns use the default header
|    {headerName: "Athlete", field: "athlete"},
|    {headerName: "Sport", field: "sport"},
|
|    // this column uses a custom header
|    {headerName: "Age", field: "age", headerComponent: MyHeaderComponent},
|
|    // you can also specify header components for groups
|    {
|        headerName: "Medals",
|        // custom header component
|        headerGroupComponent: MyHeaderGroupComponent,
|        children: [
|            {headerName: "Gold", field: "gold"},
|            {headerName: "Silver", field: "silver"},
|            {headerName: "Gold", field: "bronze"}
|        ]
|    }
|}]
|```

