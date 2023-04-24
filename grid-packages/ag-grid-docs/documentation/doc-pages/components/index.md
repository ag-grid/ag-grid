---
title: "Components"
---

[[only-javascript]]
|You can create your own custom components to customise the behaviour of the grid. For example you can customise how cells are rendered, how values are edited and also create your own filters.

[[only-vue]]
|You can create your own custom components to customise the behaviour of the grid. For example you can customise how cells are rendered, how values are edited and also create your own filters.

[[only-react]]
|<video-section id="eglfpHRpcu0" title="React Custom Components" header="true">
|You can create your own custom components to customise the behaviour of the grid. For example you can customise how cells are rendered, how values are edited and also create your own filters.
|</video-section>

[[only-angular]]
|<video-section id="A5-Li_9oPSE" title="Angular Custom Components" header="true">
|You can create your own custom components to customise the behaviour of the grid. For example you can customise how cells are rendered, how values are edited and also create your own filters.
|</video-section>


The full list of component types you can provide in AG Grid are as follows:

- [Cell Renderer](/component-cell-renderer/): To customise the contents of a cell.
- [Cell Editor](/component-cell-editor/): To customise the editing of a cell.
- [Date Component](/component-date/): To customise the date selection component in the date filter.
- [Filter Component](/component-filter/): For custom column filter that appears inside the column menu.
- [Floating Filter](/component-floating-filter/): For custom column floating filter that appears inside the column menu.
- [Header Component](/component-header/): To customise the header of a column and column groups.
- [Loading Cell Renderer](/component-loading-cell-renderer/): To customise the loading cell row when using Server Side row model.
- [Overlay Component](/component-overlay/): To customise loading and no rows overlay components.
- [Status Bar Component](/component-status-bar/): For custom status bar components.
- [Tool Panel Component](/component-tool-panel/): For custom tool panel components.
- [Tooltip Component](/component-tooltip/): For custom cell tooltip components.

The remainder of this page gives information that is common across all the component types.

md-include:declare-vue.md

md-include:register-javascript.md
md-include:register-angular.md
md-include:register-react.md 
md-include:register-vue.md
 
<grid-example title='Registering Components' name='register' type='generated' options='{ "exampleHeight": 580 }'></grid-example>

md-include:declare-angular.md

md-include:advantages-vue.md

## Providing Additional Parameters

Each Custom Component gets a set of parameters from the grid. For example, for Cell Renderer the grid provides, among other things, the value to be rendered. You can provide additional properties to the Custom Component (e.g. what currency symbol to use) by providing additional parameters specific to your application.

To provide additional parameters, use the property `[prop-name]Params`, e.g. `cellRendererParams`.

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        { 
            field: 'price',
            cellRenderer: PriceCellRenderer,
            cellRendererParams: {
                currency: 'EUR'
            }
        },
    ],
}
</snippet>

md-include:js-fw-angular.md
md-include:js-fw-react.md
md-include:js-fw-vue.md
md-include:js-fw-common-end.md

[[only-react]]
|## JavaScript Functional Components
|
|Function Components are not supported by AG Grid React. This is because the grid has no way to distinguish JavaScript Functional Components from React Functional Components. The grid identifies a JavaScript Class Component by looking for the `getGui()` method. If this method is missing, it assumes a React Component. Thus all functions will be treated as React Components / Hooks.
|
## Component Usage

The below table gives a summary of the components, where they are configured and using what attribute.

| Component                     | Where                     | Attribute | 
| ----------------------------- | ------------------------- | ------------------------ | 
| Cell Renderer                 | Column Definition         | cellRenderer<br/>cellRendererParams<br/>cellRendererSelector         | 
| Cell Editor                   | Column Definition         | cellEditor<br>cellEditorParams<br/>cellEditorSelector| 
| Filter                        | Column Definition         | filter<br/>filterParams              | 
| Floating Filter               | Column Definition         | floatingFilter<br/>floatingFilterParams       | 
| Header Component              | Column Definition         | headerComponent<br/>headerComponentParams               | 
| Header Group Component        | Column Definition         | headerGroupComponent<br/>headerGroupComponentParams         | 
| Tooltip Component             | Column Definition         | tooltipComponent<br/>tooltipComponentParams              | 
| Group Row Cell Renderer       | Grid Option               | groupRowRenderer<br/>groupRowRendererParams         | 
| Group Row Inner Cell Renderer | Grid Option               | innerRenderer<br/>innerRendererParams            | 
| Detail Cell Renderer          | Grid Option               | detailCellRenderer<br/>detailCellRendererParams        | 
| Full Width Cell Renderer      | Grid Option               | fullWidthCellRenderer<br/>fullWidthCellRendererParams        | 
| Loading Cell Renderer         | Grid Option               | loadingCellRenderer<br/>loadingCellRendererParams       |
| Loading Overlay               | Grid Option               | loadingOverlayComponent<br/>loadingOverlayComponentParams       | 
| No Rows Overlay               | Grid Option               | noRowsOverlayComponent<br/>noRowsOverlayComponentParams        |
| Date Component                | Grid Option               | dateComponent<br/>dateComponentParams                  | 
| Status Bar Component          | Grid Option -> Status Bar | statusPanel<br/>statusPanelParams          | 
| Tool Panel                    | Grid Option -> Side Bar   | toolPanel<br/>toolPanelParams            | 

## Grid Provided Components

The grid comes with pre-registered components that can be used. Each component provided by the grid starts with the namespaces 'ag' to minimise naming conflicts with user provided components. The full list of grid provided components are in the table below.

<table>
    <thead>
        <tr>
            <th colspan="2"><h3>Date Inputs</h3></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>agDateInput</td>
            <td>Default date input used by filters.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Column Headers</h3></td>
        </tr>
        <tr>
            <td>agColumnHeader</td>
            <td>Default column header.</td>
        </tr>
        <tr>
            <td>agColumnHeaderGroup</td>
            <td>Default column group header.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Column Filters</h3></td>
        </tr>
        <tr>
            <td>agSetColumnFilter<enterprise-icon></enterprise-icon></td>
            <td>Set filter (default when using AG Grid Enterprise).</td>
        </tr>
        <tr>
            <td>agTextColumnFilter</td>
            <td>Simple text filter (default when using AG Grid Community).</td>
        </tr>
        <tr>
            <td>agNumberColumnFilter</td>
            <td>Number filter.</td>
        </tr>
        <tr>
            <td>agDateColumnFilter</td>
            <td>Date filter.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Floating Filters</h3></td>
        </tr>
        <tr>
            <td>agSetColumnFloatingFilter<enterprise-icon></enterprise-icon></td>
            <td>Floating set filter.</td>
        </tr>
        <tr>
            <td>agTextColumnFloatingFilter</td>
            <td>Floating text filter.</td>
        </tr>
        <tr>
            <td>agNumberColumnFloatingFilter</td>
            <td>Floating number filter.</td>
        </tr>
        <tr>
            <td>agDateColumnFloatingFilter</td>
            <td>Floating date filter.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Cell Renderers</h3></td>
        </tr>
        <tr>
            <td>agAnimateShowChangeCellRenderer</td>
            <td>Cell renderer that animates value changes.</td>
        </tr>
        <tr>
            <td>agAnimateSlideCellRenderer</td>
            <td>Cell renderer that animates value changes.</td>
        </tr>
        <tr>
            <td>agGroupCellRenderer</td>
            <td>Cell renderer for displaying group information.</td>
        </tr>
        <tr>
            <td>agLoadingCellRenderer<enterprise-icon></enterprise-icon></td>
            <td>Cell renderer for loading row when using Enterprise row model.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Overlays</h3></td>
        </tr>
        <tr>
            <td>agLoadingOverlay</td>
            <td>Loading overlay.</td>
        </tr>
        <tr>
            <td>agNoRowsOverlay</td>
            <td>No rows overlay.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Cell Editors</h3></td>
        </tr>
        <tr>
            <td>agTextCellEditor</td>
            <td>Text cell editor.</td>
        </tr>
        <tr>
            <td>agSelectCellEditor</td>
            <td>Select cell editor.</td>
        </tr>
        <tr>
            <td>agRichSelectCellEditor<enterprise-icon></enterprise-icon></td>
            <td>Rich select editor.</td>
        </tr>
        <tr>
            <td>agLargeTextCellEditor</td>
            <td>Large text cell editor.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Master Detail</h3></td>
        </tr>
        <tr>
            <td>agDetailCellRenderer<enterprise-icon></enterprise-icon></td>
            <td>Detail panel for master / detail grid.</td>
        </tr>
    </tbody>
</table>

## Overriding Grid Components

It is also possible to override components. Where the grid uses a default value, this means the override component will be used instead. The default components, where overriding makes sense, are as follows:

- **agDateInput**: To change the default date selection across all filters.
- **agColumnHeader**: To change the default column header across all columns.
- **agColumnGroupHeader**: To change the default column group header across all columns.
- **agLoadingCellRenderer**: To change the default loading cell renderer for Enterprise Row Model.
- **agLoadingOverlay**: To change the default 'loading' overlay.
- **agNoRowsOverlay**: To change the default loading 'no rows' overlay.
- **agCellEditor**: To change the default cell editor.
- **agDetailCellRenderer**: To change the default detail panel for master / detail grids.

To override the default component, register the custom component in the GridOptions `components` property under the above name.

[[only-javascript]]
|```js
|const gridOptions = {
|    // Here is where we specify the components to be used instead of the default
|    components: {
|        agDateInput: CustomDateComponent,
|        agColumnHeader: CustomHeaderComponent
|    }
|};
|```
[[only-angular]]
|```ts
|@Component({
|    selector: 'my-app',
|    template: `
|      <ag-grid-angular
|          class="ag-theme-alpine"
|          [components]="components"
|          ...other properties...  
|      ></ag-grid-angular>
|    `
|})
|export class AppComponent {
|    // Here is where we specify the components to be used instead of the default
|    public components = {
|        agDateInput: CustomDateComponent,
|        agColumnHeader: CustomHeaderComponent
|    };
|```
[[only-react]]
|```jsx
|<AgGridReact
|    components={{ agDateInput: CustomDateComponent, agColumnHeader: CustomHeaderComponent }}
|    ...other properties...
|/>
|```
[[only-vue]]
|```js
|const MyApp = {
|    // Here is where we specify the components to be used instead of the default
|    components: {
|        'ag-grid-vue': AgGridVue
|        agDateInput: CustomDateComponent,
|        agColumnHeader: CustomHeaderComponent
|    },
|```
|
 
[[only-vue]]
|[[note]]
||Overridable grid components are the only components you need to additionally specify with `components` in order to tie their usage to the 
||actual component. All other registration types specify their usage in column definitions or on the `AgGridVue` component itself.
||
||For an example of this please refer to the [Date Component](../component-date/#registering-date-components) documentation.
