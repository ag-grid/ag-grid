<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|&lt;AgGridReact
|    sideBar: {{
|        toolPanels: [
|            {
|                id: 'customStats',
|                labelDefault: 'Custom Stats',
|                labelKey: 'customStats',
|                iconKey: 'custom-stats',
|                toolPanel: CustomStatsToolPanel,
|                toolPanelParams: {
|                    // can pass any custom props here
|                },
|            }
|        ]
|    }}
|       ...other props...
|/>
</snippet>
</framework-specific-section>