[[only-vue]]
|```js
|this.gridOptions: {
|    sideBar: {
|        toolPanels: [
|            {
|                id: 'customStats',
|                labelDefault: 'Custom Stats',
|                labelKey: 'customStats',
|                iconKey: 'custom-stats',
|                component: 'customStatsToolPanel',
|            }
|        ]
|    },
|    components: {
|        customStatsToolPanel: CustomStatsComponent
|    }
|
|    // other grid properties
|}
|```
