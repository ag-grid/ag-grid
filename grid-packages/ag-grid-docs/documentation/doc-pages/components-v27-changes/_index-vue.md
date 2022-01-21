
[[only-vue]]
|
|Configuring components was made simpler in v27.
|
|Before it was necessary to tell the grid that a Component was a Framework Component by using `xxxFramework` properties. Having separate properties for JavaScript and Framework components is no longer necessary. Now the grid works out if a Component is JavaScript or a Framework Component.
|
|For example, consider how a Cell Renderer used to be configured before and after v27.
|
|Prior to v27, the following was used:
|
|```js
|export default {
|   components: {
|       AgGridVue,
|       // Vue components are registered here
|       'vueComponent': VueComponent
|   }
|   data() {
|       return {
|           // JavaScript components are registered here
|           components: [
|               // declare the javascript component
|               'javascriptComponent': JavascriptComponent
|           ],          
|           columnDefs: [
|                {
|                   headerName: "JS Cell",
|                   field: "value",
|                   cellRenderer: 'javascriptComponent',    // reference/use the javascript component by name
|                   cellRendererParams: {a: 'something'}
|               },
|                {
|                   headerName: "JS Cell",
|                   field: "value",
|                   cellRenderer: JavascriptComponent,    // reference/use the javascript component directly
|               },
|               {
|                   headerName: "Vue Cell",
|                   field: "value",
|                   cellRendererFramework: 'vueComponent',  // reference/use the Vue component
|               }
|           ]
|       }
|   }
|   //...other properties & methods
|}
|```
|
|| Old Property             | Description     |
|| ------------------------ | ------------------------- |
|| cellRenderer             | A JavaScript Cell Renderer|
|| cellRendererFramework    | A Framework Cell Renderer |
|| cellRendererParams       | Additional parameters      |
|
|From v27 onwards, the following is used:
|
|```js
|export default {
|   components: {
|       AgGridVue,
|       // Vue components are registered here
|       'vueComponent': VueComponent
|   }
|   data() {
|       return {
|           // JavaScript components are registered here
|           comps: [
|               // declare the javascript component
|               'javascriptComponent': JavascriptComponent
|           ],          
|           columnDefs: [
|                {
|                   headerName: "JS Cell",
|                   field: "value",
|                   cellRendererComp: 'javascriptComponent',    // reference/use the javascript component by name
|                   cellRendererCompParams: {a: 'something'}
|               },
|                {
|                   headerName: "JS Cell",
|                   field: "value",
|                   cellRendererComp: JavascriptComponent,    // reference/use the javascript component directly
|               },
|               {
|                   headerName: "Vue Cell",
|                   field: "value",
|                   cellRendererComp: 'vueComponent',  // reference/use the Vue component
|               }
|           ]
|       }
|   }
|   //...other properties & methods
|}
|```
|
|| New Property             | Description       |
|| ------------------------ | ------------------------- |
|| cellRendererComp         | Replaces cellRenderer and cellRendererFramework, can be either JavaScript or Framework Component  |
|| cellRendererCompParams   | Same as cellRendererParams  |
|
|In other words, now when providing components, you always use the same property (`cellRendererComp` for Cell Renderers) regardless of whether it is a JavaScript or Framework Component.
|
|Also note that the grid property `components` is now simply `comps`.
|
|## Advantages
|
|The changes were done for two reasons.
|
|Firstly the new approach results in less verbose code. The word `framework` isn't appearing everywhere when providing Framework Components.
|
|Secondly for consistency. Configurations are now the same for JavaScript and Frameworks, thus less confusing for those who switch between both.
|
|## Non Breaking Change
|
|This is a non-breaking change. The old properties still work as before. The new logic is applied only to the new property names. There is no plan to deprecate the old property names, thus there is no need to migrate your code. We intend to keep the old property names working in the background for backwards compatibility.
|
|This means there is now duplication in the interface (two ways to configure the same thing). We decided this duplication was better than removing the properties and creating a breaking change.
|
|All the documentation and documentation examples (except this page) have been migrated to use the new property names.
|
|## Selectors
|
|For Selectors (Cell Renderer and Cell Editor only), the alternatives to these are simplified. The result of the new selectors do not need to specify the type (JS or Framework) of the component.
|
|Before v27, the following was used:
|
|```js
|export default {
|   components: {
|       AgGridVue,
|       // Vue components are registered here
|       'vueComponent': VueComponent
|   }
|   data() {
|       return {
|           columnDefs: [
|                {
|                   field: "value",
|                   cellRendererSelector: params => {
|                      if (params.value<10) {
|                         return { // returns a Vue component
|                             frameworkComponent: 'vueComponent'
|                         }
|                      } else {
|                         return { // returns a JavaScript component
|                             component: MyJsComponent
|                         }                      
|                      }
|                   },
|               }
|           ]
|       }
|   }
|   //...other properties & methods
|}
|```
|
|From v27 onwards, the following is used:
|
|```js
|export default {
|   components: {
|       AgGridVue,
|       // Vue components are registered here
|       'vueComponent': VueComponent
|   }
|   data() {
|       return {
|           columnDefs: [
|                {
|                   field: "value",
|                   cellRendererCompSelector: params => {
|                      if (params.value<10) {
|                         return { // returns a Vue component
|                             comp: 'vueComponent'
|                         }
|                      } else {
|                         return { // returns a JavaScript component
|                             comp: MyJsComponent
|                         }                      
|                      }
|                   },
|               }
|           ]
|       }
|   }
|   //...other properties & methods
|}
|```
|
| Note the return of the selector has `comp` instead of one of `component` or `frameworkComponent`.
|
|## Using Functional JavaScript Components
|
|The old configuration allowed using JavaScript Functional Components. This does not work with the new configuration options, as such functions will be missing the `getGui()` method and will be mistakenly treated as Framework Components.
|
|If you are using JavaScript Functional Components inside a Vue grid, then refer to the Functional Component the old way. For example to specify a Functional Cell Renderer, use `cellRenderer` instead of `cellRendererComp`.
|
|If you want to use the new properties for such components, convert them to Class Components.
|
|## All Changed Properties
|
|The table below lists all the changed properties.
|
|| Component                     | Old Properties | New Properties |
|| ----------------------------- | ------------------------- | ------------------------ | 
|| Cell Renderer                 | cellRenderer<br/>cellRendererFramework<br/>cellRendererParams<br/>cellRendererSelector         | cellRendererComp<br/>cellRendererCompParams<br/>cellRendererCompSelector         | 
|| Cell Editor                   | cellEditor<br>cellEditorFramework<br>cellEditorParams<br/>cellEditorSelector | cellEditorComp<br>cellEditorCompParams<br/>cellEditorCompSelector | 
|| Filter                        | filter<br/>filterFramework<br/>filterParams              | filterComp<br/>filterCompParams              | 
|| Floating Filter               | floatingFilter<br/>floatingFilterFramework<br/>floatingFilterParams       | floatingFilterComp<br/>floatingFilterCompParams       | 
|| Header Component              | header<br/>headerFramework<br/>headerParams               | headerComp<br/>headerCompParams               | 
|| Header Group Component        | headerGroup<br/>headerGroupFramework<br/>headerGroupParams         | headerGroupComp<br/>headerGroupCompParams         | 
|| Tooltip Component             | tooltip<br/>tooltipFramework<br/>tooltipParams              | tooltipComp<br/>tooltipCompParams              | 
|| Group Row Cell Renderer       | groupRowCell<br/>groupRowCellFramework<br/>groupRowCellParams         |  groupRowCellComp<br/>groupRowCellCompParams         | 
|| Group Row Inner Cell Renderer | innerCell<br/>innerCellFramework<br/>innerCellParams            | innerCellComp<br/>innerCellCompParams            | 
|| Detail Cell Renderer          | detailRowCell<br/>detailRowCellFramework<br/>detailRowCellParams        | detailRowCellComp<br/>detailRowCellCompParams        | 
|| Full Width Cell Renderer      | fullWidthCell<br/>fullWidthCellFramework<br/>fullWidthCellParams        | fullWidthCellComp<br/>fullWidthCellCompParams        | 
|| Loading Cell Renderer         | loadingRowCell<br/>loadingRowCellFramework<br/>loadingRowCellParams       | loadingRowCellComp<br/>loadingRowCellCompParams       |
|| Loading Overlay               | loadingOverlay<br/>loadingOverlayFramework<br/>loadingOverlayParams       | loadingOverlayComp<br/>loadingOverlayCompParams       | 
|| No Rows Overlay               | noRowsOverlay<br/>noRowsOverlayFramework<br/>noRowsOverlayParams        | noRowsOverlayComp<br/>noRowsOverlayCompParams        |
|| Date Component                | date<br/>dateFramework<br/>dateParams                  | dateComp<br/>dateCompParams                  | 
|| Status Bar Component          | statusPanel<br/>statusPanelFramework<br/>statusPanelParams          | statusPanelComp<br/>statusPanelCompParams          | 
|| Tool Panel                    | toolPanel<br/>toolPanelFramework<br/>toolPanelParams            | toolPanelComp<br/>toolPanelCompParams            | 


