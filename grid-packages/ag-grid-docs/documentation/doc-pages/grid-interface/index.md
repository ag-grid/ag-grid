---
title: "Grid Overview" 
---

This section provides key information for configuring and interacting with a grid. 

## Grid Options

md-include:index-javascript.md 
md-include:index-angular.md
md-include:index-react.md 
md-include:index-vue.md
 
### Updating Grid Options

It is a common requirement to update a grid option after the grid has been created. For example, you may want to change `rowHeight` via an application toggle.  

<framework-specific-section frameworks="javascript">
| Properties can be updated by calling either `api.setGridOption` or `api.updateGridOptions`. In this example all the rows will be redrawn with the new height.
</framework-specific-section>


<framework-specific-section frameworks="angular,vue">
| Simply update the bound property and the grid will respond to the new value. In this example all the rows will be redrawn with the new height.
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
| &lt;ag-grid-angular
|    [rowHeight]="rowHeight"    
| &lt;/ag-grid-angular>
|
| updateHeight() {
|   this.rowHeight = 50;
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
| &lt;ag-grid-vue
|    :row-height="rowHeight"
| &lt;/ag-grid-vue>
|
| updateHeight() {
|   this.rowHeight = 50;
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular,vue">
| Properties can also be updated by calling either `api.setGridOption` or `api.updateGridOptions`.
</framework-specific-section>

<framework-specific-section frameworks="react">
| Simply update your state and the grid will respond to the new value. In this example all the rows will be redrawn with the new height.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
| const [rowHeight, setRowHeight] = useState(25);
|
| // Callback to update the rowHeight
| const updateHeight = () => setRowHeight(50);
|
| &lt;AgGridReact
|    rowHeight={rowHeight}
| />
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| We recommend updating options via `AgGridReact` props but it is also possible to updated a property via `api.setGridOption` or `api.updateGridOptions`.
</framework-specific-section>

<framework-specific-section frameworks="javascript,angular,vue,react">
<snippet transform={false}>
| // update the rowHeight
|api.setGridOption('rowHeight', 50); 
</snippet>
</framework-specific-section>


### Initial Grid Options

A small number of Grid Options do **not** support updating their value. Their value is only read during the initial setup of the grid. These options are marked as `Initial` on the [Options Reference](/grid-options). For these properties the grid must be destroyed and re-created for the new value to take effect.

<note>
Not all Grid Options support updates. These are marked as Initial.
</note>

For a full list of options see: [Options Reference](/grid-options).

## Grid Events
 
As a user interacts with the grid events will be fired to enable your application to respond to specific actions.  

md-include:events-javascript.md 
md-include:events-angular.md    
md-include:events-react.md   
md-include:events-vue.md    
 
<note>
TypeScript users can take advantage of the events' interfaces. Construct the interface name by suffixing the event name with `Event`. For example, the `cellClicked` event uses the interface `CellClickedEvent`. All events support [Typescript Generics](../typescript-generics/).
</note>

For a full list of events see: [Grid Events](/grid-events).
 
## Grid API 
 
md-include:api-javascript.md  
md-include:api-angular.md    
md-include:api-react.md  
md-include:api-vue.md
 
For a full list of api methods see: [Grid API](/grid-api).  

## Grid State

As a user interacts with the grid they may change state such as filtering, sorting and column order. This state is independent of the configuration and to provide save and restore capabilities the grid enables applications to save / restore this state.

For a full list of the state properties see: [Grid State](/grid-state/).

## Grid Lifecycle
 
When working with AG Grid it is a common requirement to perform actions when the grid is first initialised, when data is first rendered and when the grid is about to be destroyed. 

For full details about how to interact with the grid at these key moments see: [Grid Lifecycle](/grid-lifecycle/).
