[[only-react]]
|```jsx
|<AgGridReact 
|       statusBar: {{
|           statusPanels: [
|               {
|                   statusPanel: MyStatusBarComponent
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
|
|In the configuration above we've specified a custom component (`MyStatusBarComponent`) as well as the provided `agAggregationComponent` component.