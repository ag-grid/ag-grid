[[only-vue]]
|```js
|this.gridOptions = {
|    statusBar: {
|        statusPanels: [
|            {
|                statusPanelFramework: 'myStatusBarComponent'
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
