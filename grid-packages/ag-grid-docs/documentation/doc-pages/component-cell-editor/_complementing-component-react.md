[[only-react]]
|
|```jsx
|// define cell editor to be used
|const MyCellEditor = ...cell editor definition...
|
|const GridExample = () => {
|   // other properties & methods
|
|   frameworkComponents = {
|       'myCellEditor': MyCellEditor    
|   };
|
|   return (
|       <div className="ag-theme-alpine">
|           <AgGridReact
|           frameworkComponents={frameworkComponents}
|           ...other properties>
|               { /* make "country" value available to cell editor */ }
|               <AgGridColumn headerName="Value Column" field="value" cellEditor="myCellEditor" cellEditorParams={{ country: 'Ireland' }} />
|           </AgGridReact>
|       </div>
|   );
|};
|```
