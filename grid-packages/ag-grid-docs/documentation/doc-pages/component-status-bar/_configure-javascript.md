<framework-specific-section frameworks="javascript">
<snippet transform={false}>
|const gridOptions = {
|    statusBar: {
|        statusPanels: [
|            {
|                statusPanel: MyStatusBarComponent
|            },
|            {
|                statusPanel: 'agAggregationComponent',
|                statusPanelParams : {
|                    // only show count and sum ('min', 'max', 'avg' won't be shown)
|                    aggFuncs: ['count', 'sum']
|                }
|            }
|        ]
|    },
|    // ...other properties
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
|In the configuration above we've specified a custom component (`MyStatusBarComponent`) as well as the provided `agAggregationComponent` component.
</framework-specific-section>