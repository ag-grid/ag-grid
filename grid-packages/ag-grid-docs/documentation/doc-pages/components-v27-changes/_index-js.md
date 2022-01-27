[[only-javascript]]
|
|We have changed how Components are configured in v27.
|
|Before it was necessary to tell the grid that a Component was a Framework Component by using `xxxFramework` properties. Having separate properties for JavaScript and Framework components is no longer necessary. Now the grid works out if a Component is JavaScript or a Framework Component.
|
|The Vanilla JavaScript version of the grid does not benefit from these changes (as you never set Framework Components), however the grid core is shared by all versions and these changes impact the Vanilla JavaScript version even though there is no benefit.
|
|The difference for Vanilla JavaScript is some subtle changes to the property names. As an example, take how Cell Renderers are configured. Prior to v27, the following was used:
|
|<snippet spaceBetweenProperties="true">
|const gridOptions = {
|    columnDefs: [
|        { 
|            field: 'name',
|            cellRenderer: NameJsCellRenderer, // JS Component
|            cellRendererParams: {a: 'something'}
|        }
|    ],
|}
|</snippet>
|
|From v27 onwards, the following is used:
|
|<snippet spaceBetweenProperties="true">
|const gridOptions = {
|    columnDefs: [
|        { 
|            field: 'name',
|            cellRendererComp: NameJsCellRenderer, // cellRenderer is now called cellRendererComp
|            cellRendererCompParams: {a: 'something'}
|        }
|    ],
|}
|</snippet>
|
| In short, instead of using `cellRenderer` you use `cellRendererComp` and instead of using `cellRendererParams` you use `cellRendererCompParams`.
|
|## Advantages
|
|There are no advantages when using the Vanilla JavaScript version of the grid. The advantages are for React, Angular and Vue users.
|
|## Non Breaking Change
|
|This is a non-breaking change. The old properties still work as before. There is no plan to deprecate the old property names, thus there is no need to migrate your code. We intend to keep the old property names working in the background for backwards compatibility.
|
|This means there is now duplication in the interface (two ways to configure the same thing). We decided this duplication was better than removing the properties and creating a breaking change.
|
|All the documentation and documentation examples (except this page) have been migrated to use the new property names.
|
|## Registering Components
|
|Before when registering components, JavaScript components were registered using `components` property. Now they should be used using the `comps` property.
|
|Prior to v27, registering Components was done as follows:
|
|<snippet spaceBetweenProperties="true">
|const gridOptions = {
|    components: {
|        nameJs: NameJsCellRenderer // JS Component
|    },
|    columnDefs: [
|        { 
|            field: 'name',
|            cellRenderer: 'nameJs'
|        }
|    ],
|}
|</snippet>
|
|For v27 onwards, registering Components is as follows:
|
|<snippet spaceBetweenProperties="true">
|const gridOptions = {
|    comps: {
|        nameJs: NameJsCellRenderer, // JS Component
|    },
|    columnDefs: [
|        { 
|            field: 'name',
|            cellRenderer: 'nameJs'
|        }
|    ],
|}
|</snippet>
|
|## Selectors
|
|For Selectors (Cell Renderer and Cell Editor only), the alternatives to these are simplified. The result object is simplified. Again the full benefits are seen when using a Framework. For JavaScript users, it's just name changes.
|
|Before v27, the following was used:
|
|<snippet spaceBetweenProperties="true">
|const gridOptions = {
|    columnDefs: [
|        { 
|            field: 'rating',
|            cellRendererSelector: params => {
|                let comp = params.value>10 ? LowRatingCellRenderer : HighRatingCellRenderer;
|                return {
|                    component: comp
|                };
|            }
|        }
|    ],
|}
|</snippet>
|
|From v27 onwards, the following is used:
|
|<snippet spaceBetweenProperties="true">
|const gridOptions = {
|    columnDefs: [
|        { 
|            field: 'rating',
|            cellRendererCompSelector: params => {
|                let comp = params.value>10 ? LowRatingCellRenderer : HighRatingCellRenderer;
|                return {
|                    comp: comp
|                };
|            }
|        }
|    ],
|}
|</snippet>
|
|## All Changed Properties
|
|The table below lists all the changed properties.
|
|| Component                     | Old Properties | New Properties |
|| ----------------------------- | ------------------------- | ------------------------ | 
|| Cell Renderer                 | cellRenderer<br/>cellRendererParams<br/>cellRendererSelector         | cellRendererComp<br/>cellRendererCompParams<br/>cellRendererCompSelector         | 
|| Cell Editor                   | cellEditor<br>cellEditorParams<br/>cellEditorSelector | cellEditorComp<br>cellEditorCompParams<br/>cellEditorCompSelector | 
|| Filter                        | filter<br/>filterParams              | filterComp<br/>filterCompParams              | 
|| Floating Filter               | floatingFilter<br/>floatingFilterParams       | floatingFilterComp<br/>floatingFilterCompParams       | 
|| Header Component              | header<br/>headerParams               | headerComp<br/>headerCompParams               | 
|| Header Group Component        | headerGroup<br/>headerGroupParams         | headerGroupComp<br/>headerGroupCompParams         | 
|| Tooltip Component             | tooltip<br/>tooltipParams              | tooltipComp<br/>tooltipCompParams              | 
|| Group Row Cell Renderer       | groupRowCell<br/>groupRowCellParams         |  groupRowCellComp<br/>groupRowCellCompParams         | 
|| Group Row Inner Cell Renderer | innerCell<br/>innerCellParams            | innerCellComp<br/>innerCellCompParams            | 
|| Detail Cell Renderer          | detailRowCell<br/>detailRowCellParams        | detailRowCellComp<br/>detailRowCellCompParams        | 
|| Full Width Cell Renderer      | fullWidthCell<br/>fullWidthCellParams        | fullWidthCellComp<br/>fullWidthCellCompParams        | 
|| Loading Cell Renderer         | loadingRowCell<br/>loadingRowCellParams       | loadingRowCellComp<br/>loadingRowCellCompParams       |
|| Loading Overlay               | loadingOverlay<br/>loadingOverlayParams       | loadingOverlayComp<br/>loadingOverlayCompParams       | 
|| No Rows Overlay               | noRowsOverlay<br/>noRowsOverlayParams        | noRowsOverlayComp<br/>noRowsOverlayCompParams        |
|| Date Component                | date<br/>dateParams                  | dateComp<br/>dateCompParams                  | 
|| Status Bar Component          | statusPanel<br/>statusPanelParams          | statusPanelComp<br/>statusPanelCompParams          | 
|| Tool Panel                    | toolPanel<br/>toolPanelParams            | toolPanelComp<br/>toolPanelCompParams            | 
|| Group Cell - Inner Renderer   | innerRenderer<br/>innerRendererParams<br/>innerRendererSelector     | innerRendererComp<br/>innerRendererCompParams<br/>innerRendererCompSelector | 
|| Set Filter - Cell Renderer   | cellRenderer<br/>cellRendererParams         | cellRendererComp<br/>cellRendererCompParams         | 
