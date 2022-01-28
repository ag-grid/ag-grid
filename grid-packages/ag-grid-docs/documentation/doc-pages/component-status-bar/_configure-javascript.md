[[only-javascript]]
|```js
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
|```
