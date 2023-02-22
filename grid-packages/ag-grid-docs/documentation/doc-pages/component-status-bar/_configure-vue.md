[[only-vue]]
|```js
|this.gridOptions = {
|    statusBar: {
|        statusPanels: [
|            {
|                statusPanel: 'myStatusBarComponent'
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
|```
|
|In the configuration above we've specified a custom component (`myStatusBarComponent`) as well as the provided `agAggregationComponent` component.