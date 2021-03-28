[[only-react]]
|Note that both the `headerComponent` and the `headerGroupComponent` components have already been registered in the Grid's `frameworkComponents` prop.
|
|```jsx
|<AgGridReact ..grid component props...>
|    <AgGridColumn field="athlete" />
|    <AgGridColumn field="sport" />
|    <AgGridColumn field="age" headerComponent: "myHeaderComponent" /> 
|    <AgGridColumn headerName="Medals" headerGroupComponent: "myHeaderGroupComponent"> 
|        <AgGridColumn field="gold" />
|        <AgGridColumn field="silver" />
|        <AgGridColumn field="bronze" />
|    </AgGridColumn>
|</AgGridReact>
|```
