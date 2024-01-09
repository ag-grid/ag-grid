<framework-specific-section frameworks="javascript">
<snippet transform={false}>
|const gridOptions: {
|    sideBar: {
|        toolPanels: [
|            {
|                id: 'customStats',
|                labelDefault: 'Custom Stats',
|                labelKey: 'customStats',
|                iconKey: 'custom-stats',
|                toolPanel: CustomStatsToolPanel,
|                toolPanelParams: {
|                    // can pass any custom params here
|                },
|            }
|        ]
|    }
|
|    // other grid properties
|}
</snippet>
</framework-specific-section>