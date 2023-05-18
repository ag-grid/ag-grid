<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|&lt;AgGridReact 
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
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
|In the configuration above we've specified a custom component (`MyStatusBarComponent`) as well as the provided `agAggregationComponent` component.
</framework-specific-section>