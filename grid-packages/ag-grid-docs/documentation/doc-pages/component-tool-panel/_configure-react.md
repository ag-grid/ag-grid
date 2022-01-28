[[only-react]]
|```jsx
|<AgGridReact
|    sideBar: {{
|        toolPanels: [
|            {
|                id: 'customStats',
|                labelDefault: 'Custom Stats',
|                labelKey: 'customStats',
|                iconKey: 'custom-stats',
|                toolPanelFramework: CustomStatsToolPanel,
|            }
|        ]
|    }}
|       ...other props...
|/>
|```
