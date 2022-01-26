[[only-angular]]
|```js
|// a list of column definitions
|const colDefs = [{
|
|    // these columns use the default header
|    {headerName: "Athlete", field: "athlete"},
|    {headerName: "Sport", field: "sport"},
|
|    // this column uses a custom header
|    // component specified in comps
|    {headerName: "Age", field: "age", headerComp: MyHeaderComponent},
|
|    // you can also specify header components for groups
|    {
|        headerName: "Medals",
|        // custom header component component specified in comps
|        headerGroupComp: MyHeaderGroupComp,
|        children: [
|            {headerName: "Gold", field: "gold"},
|            {headerName: "Silver", field: "silver"},
|            {headerName: "Gold", field: "bronze"}
|        ]
|    }
|}]
|```
