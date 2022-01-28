[[only-react]]
|```jsx
|<AgGridReact 
|       statusBar: {{
|           statusPanels: [
|               {
|                   statusPanelFramework: MyStatusBarComponent
|               },
|               {
|                   statusPanel: 'agAggregationComponent',
|                   statusPanelParams : {
|                       // only show count and sum ('min', 'max', 'avg' won't be shown)
|                       aggFuncs: ['count', 'sum']
|                   }
|               }
|           ]
|       }}
|       ...other props...
|/>
|```
