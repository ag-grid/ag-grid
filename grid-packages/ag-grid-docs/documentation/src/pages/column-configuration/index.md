---
title: "Column Configuration"
frameworks: ["react"]
---

After importing `AgGridReact` you can then reference the component inside your JSX definitions. An example of the Grid Component can be seen below:

```jsx
// Grid Definition
<AgGridReact
    // listening for events
    onGridReady={ onGridReady }

    // binding to array properties
    rowData={ rowData }

    // no binding, just providing hard coded strings for the properties
    // boolean properties will default to true if provided (ie animateRows => animateRows="true")
    rowSelection="multiple"
    animateRows

    // setting grid wide date component
    dateComponentFramework={DateComponent}

    // setting default column properties
    defaultColDef={{
        headerComponentFramework: SortableHeaderComponent,
        headerComponentParams: {
            menuIcon: 'fa-bars'
        }
    }}>

    // column definitions
    <AgGridColumn field="make"></AgGridColumn>
</AgGridReact>
```

## Configuring the Columns

Columns can be defined in three ways: declaratively (i.e. via markup), via `GridOptions` 
or by binding to `columnDefs`. 

In all cases all [column definition properties](../column-properties/) can 
be defined to make up a column definition. 

Defining columns declaratively:

```jsx
<AgGridReact rowData={rowData}>
    <AgGridColumn field="make"></AgGridColumn>
    <AgGridColumn field="model"></AgGridColumn>
    <AgGridColumn field="price"></AgGridColumn>
</AgGridReact>
```

Defining columns via `GridOptions`:

```jsx
constructor(props) {
    super(props);

    this.state = {
        gridOptions = {
            columnDefs: [
                { make: "Toyota", model: "Celica", price: 35000 },
                { make: "Ford", model: "Mondeo", price: 32000 },
                { make: "Porsche", model: "Boxter", price: 72000 }
            ]
        }
    };
}

render() {
    return (
        <AgGridReact gridOptions={this.state.gridOptions}></AgGridReact>
    )
}
```

Defining columns by binding to a property:

```jsx
constructor(props) {
    super(props);

    this.state = {
        columnDefs: [
            { make: "Toyota", model: "Celica", price: 35000 },
            { make: "Ford", model: "Mondeo", price: 32000 },
            { make: "Porsche", model: "Boxter", price: 72000 }
        ]
    };
}

render() {
    return (
        <AgGridReact columnDefs={this.state.columnDefs}></AgGridReact>
    )
}
```

A full working Grid definition is shown below, illustrating various Grid & Column property definitions:

```jsx
<AgGridReact
    // listening for events
    onGridReady={onGridReady}

    // binding to array properties
    rowData={rowData}

    // no binding, just providing hard coded strings for the properties
    // boolean properties will default to true if provided (ie animateRows => animateRows="true")
    rowSelection="multiple"
    animateRows

    // setting grid wide date component
    dateComponentFramework={DateComponent}

    // setting default column properties
    defaultColDef={
        sortable: true,ok
        filter: true,
        headerComponentFramework: SortableHeaderComponent,
        headerComponentParams: {
            menuIcon: 'fa-bars'
        }
    }}>

    <AgGridColumn headerName="#" width={ 30 } checkboxSelection suppressMenu pinned></AgGridColumn>
    <AgGridColumn headerName="Employee" headerGroupComponentFramework={ HeaderGroupComponent }>
        <AgGridColumn field="name" cellEditorFramework={ NameCellEditor }></AgGridColumn>
        <AgGridColumn field="country"
                      filterParams={{ cellRenderer: CountryCellRenderer, cellHeight:20 }}>
        </AgGridColumn>
    </AgGridColumn>
</AgGridReact>
```
Note that this example also demonstrates nested columns with the `Employee` column having 
two child columns: `name` and `country`.

### Working Examples

You can find fully working examples at our [ag Grid React Example](https://github.com/ag-grid/ag-grid-react-example/).
