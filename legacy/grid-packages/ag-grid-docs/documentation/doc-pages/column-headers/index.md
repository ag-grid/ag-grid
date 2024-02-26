---
title: "Column Headers"
---

Column Headers by default use the Provided Header Component. The default can be overridden with Custom Header Component. This page explains how to use the Provided Header Component, create your own Custom Header Component, and general Header configuration.

This example shows a Custom Header Component. Note the following:

- Column moving and resizing works without custom logic.
- Use of `suppressMenu=true` to supporess the menu.
- Use of `sortable=false` to suppress sorting.
- Configurable menu icon.

<grid-example title='Header component' name='header-component' type='generated' options='{ "extras": ["fontawesome"] }'></grid-example>

## Selecting Components

Specify the Header Component using the Column Definition `headerComponent`.

md-include:column-def-javascript.md
md-include:column-def-vue.md

See [Registering Components](../components/) for an overview of registering componnets.

## Custom Component

<framework-specific-section frameworks="javascript,angular,vue">
|The interface for a custom header component is:
</framework-specific-section>

md-include:component-interface-javascript.md
md-include:component-interface-angular.md
md-include:component-interface-vue.md

<framework-specific-section frameworks="javascript">
|The `init(params)` method takes a params object with the items listed below.
</framework-specific-section>
<framework-specific-section frameworks="angular">
|The `agInit(params)` method takes a params object with the items listed below.
</framework-specific-section>
<framework-specific-section frameworks="vue">
|When a Vue component is instantiated the grid will make the grid APIs, a number of utility methods as well as the cell and 
|row values available to you via `this.params` - the interface for what is provided is documented below.
</framework-specific-section>
<framework-specific-section frameworks="react">
|The following props are passed to the Custom Component (`CustomHeaderProps` interface).
</framework-specific-section>

<framework-specific-section frameworks="javascript,angular,vue">
<interface-documentation interfaceName='IHeaderParams' config='{ "description": "" }'></interface-documentation>
</framework-specific-section>
<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomHeaderProps' config='{ "description": "" }'></interface-documentation>
</framework-specific-section>

### Responsibilities

The grid provides the following features that should not be implemented by Custom Header Components:

- [**Resizing:**](/column-sizing/) When enabled, the grid will put an invisible widget to be grabbed by the mouse for resizing.
- [**Checkbox Selection:**](/row-selection/) When enabled, the grid puts a checkbox for 'select all' in the header.
- **Column Moving** The grid will react to Column Dragging to reorder columns.

The Custom Header Component is responsible for the following:

- **Sorting:** You will need to process user interaction for sorting. The default grid component sorts when the user clicks the header with the mouse. You may also need to display icons as the sort state of the column changes.
- **Filtering:** You do not filter via the column (you filter from inside the menu), however you may need to display icons as the filter state of the column changes.
- **Menu:** If you want the user to be able to open the column menu, you will need to manage this user interaction. The default grid component provides a button for the user to click to show the menu.
- **Anything Else:** Whatever you want, you are probably creating a custom header to add your own functionality in.


### Sorting

How you interact with the user for sorting (eg do you listen for mouse clicks?) is up to you. The grid helps you by providing column state and events for getting and setting the sort.

After the user requests a sort, you should call ONE of the following:

<framework-specific-section frameworks="javascript,angular,vue">
| 1. `params.progressSort(multiSort):` This is the simplest. Call it to progress the sort on the column to the next stage. Using this uses the grid logic for working out what the next sort stage is (eg 'descending' normally follows 'ascending').
| 1. `params.setSort(direction, multiSort):` Use this to set to sort to a specific state. Use this if you don't want to use the grids logic for working out the next sort state.
</framework-specific-section>

<framework-specific-section frameworks="react">
| 1. `props.progressSort(multiSort):` This is the simplest. Call it to progress the sort on the column to the next stage. Using this uses the grid logic for working out what the next sort stage is (eg 'descending' normally follows 'ascending').
| 1. `props.setSort(direction, multiSort):` Use this to set to sort to a specific state. Use this if you don't want to use the grids logic for working out the next sort state.
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
| // option 1) tell the grid when you want to progress the sorting
| myHeaderElement.addEventListener('click', function(event) {
|     // in this example, we do multi sort if Shift key is pressed
|     params.progressSort(event.shiftKey);
| });
| 
| // or option 2) tell the grid when you want to set the sort explicitly
| // button that always sorts ASCENDING
| mySortAscButton.addEventListener('click', function(event) {
|     params.setSort('asc', event.shiftKey);
| });
| 
| // button that always sorts DESCENDING
| mySortDescButton.addEventListener('click', function(event) {
|     params.setSort('desc', event.shiftKey);
| });
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular,vue">
<snippet transform={false}>
| // option 1) tell the grid when you want to progress the sorting
| onSortClicked(event) {
|      // in this example, we do multi sort if Shift key is pressed
|     this.params.progressSort(event.shiftKey);
| };
| 
| // or option 2) tell the grid when you want to set the sort explicitly
| // button that always sorts ASCENDING
| onSortAscClicked(event) {
|     this.params.setSort('asc', event.shiftKey);
| };
| 
| // button that always sorts DESCENDING
| onSortDescClicked(event) {
|     this.params.setSort('desc', event.shiftKey);
| };
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false}>
| // option 1) tell the grid when you want to progress the sorting
| onSortClicked(event) {
|      // in this example, we do multi sort if Shift key is pressed
|     this.props.progressSort(event.shiftKey);
| };
| 
| // or option 2) tell the grid when you want to set the sort explicitly
| // button that always sorts ASCENDING
| onSortAscClicked(event) {
|     this.props.setSort('asc', event.shiftKey);
| };
| 
| // button that always sorts DESCENDING
| onSortDescClicked(event) {
|     this.props.setSort('desc', event.shiftKey);
| };
</snippet>
</framework-specific-section>

To know when a column's sort state has change (eg when to update your icons), you should listen for `sortChanged` event on the column.


<snippet transform={false}>
|// listen to the column for sort events
|column.addEventListener('sortChanged', function() {
|
|    // get sort state from column
|    var sort = column.getSort();
|    console.log('sort state of column is ' + sort); // prints one of ['asc',desc',null]
|
|    // then do what you need, eg set relevant icons visible
|    var sortingAscending = sort==='asc';
|    var sortingDescending = sort==='desc';
|    var notSorting = !sortingAscending && !sortingDescending;
|    // how you update your GUI accordingly is up to you
|});
|
|// don't forget to remove your listener in your destroy code
</snippet>

### Filtering

The header doesn't normally initiate filtering. If it does, use the standard grid API to set the filter. The header will typically display icons when the filter is applied. To know when to show a filter icon, listen to the column for filterChanged events.

<snippet transform={false}>
|// listen to the column for filter events
|column.addEventListener('filterChanged', function() {
|    // when filter changes on the col, this will print one of [true,false]
|    console.log('filter of column is ' + column.isFilterActive());
|});
|
|// don't forget to remove your listener in your destroy code
</snippet>

### Menu

How you get the user to ask for the column menu is up to you. When you want to display the menu, call the `params.showColumnMenu()` callback. The callback takes the HTML element for the button so that it can place the menu over the button (so the menu appears to drop down from the button).

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
| myMenuButton.addEventListener('click', function() {
|     params.showColumnMenu(myMenuButton);
| });
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
| onMenuClicked() {
|     this.params.showColumnMenu(this.$refs.menuButton);
| });
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
| onMenuClicked() {
|     this.params.showColumnMenu(this.menuButton.nativeElement);
| });
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false}>
| onMenuClicked() {
|     this.props.showColumnMenu(refButton.current);
| });
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript,angular,vue">
<h3 id="refresh">Refresh</h3>
</framework-specific-section>

<framework-specific-section frameworks="javascript,angular,vue">
|The `refresh(params)` method gets called when the application updates the Column Definitions. For example the application could set a `headerName` attribute and then set the Column Definitions again. In this instance, the Header Component should update the displayed header name.
|
|It is the responsibility of the Header Component to inspect the Column Definition for relevant changes and updated if needed. If the refresh was successful then `true` should be returned. If the refresh was not successful then `false` should be returned. If `false` is returned, then the grid will destroy and recreate the component. This pattern is consistent with the `refresh` method of Cell Renderers.
</framework-specific-section>

### Custom Props

On top of the props provided by the grid, you can also provide your own parameters. This is useful if you want to 'configure' the header component. For example, you might have a header component for formatting currency but that needs the currency symbol.

<framework-specific-section frameworks="javascript,angular,react">
<snippet transform={false}>
|colDef = {
|    ...
|    headerComponent: MyHeaderComponent;
|    headerComponentParams : {
|        currencySymbol: '£' // the pound symbol will be placed into params
|    }
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|colDef = {
|    ...
|    headerComponent: 'MyHeaderComponent';
|    headerComponentParams : {
|        currencySymbol: '£' // the pound symbol will be placed into params
|    }
|}
</snippet>
</framework-specific-section>


### Keyboard Navigation

When using Custom Header Components, the Custom Header Component is responsible for implementing support for keyboard navigation among its focusable elements. This is why by default, focusing a grid header with a Custom Header Component will focus the entire cell instead of any of the elements inside. 

Adding support for keyboard navigation and focus requires a custom `suppressHeaderKeyboardEvent` function in grid options. See [Suppress Keyboard Events](/keyboard-navigation/#suppress-keyboard-events).

An example of this is shown below, enabling keyboard navigation through the custom header elements when pressing <kbd>⇥ Tab</kbd> and <kbd>⇧ Shift</kbd>+<kbd>⇥ Tab</kbd>:

- Click on the top left `Athlete` header, press the <kbd>⇥ Tab</kbd> key and notice that the button, textbox and link in the `Country` header can be tabbed into. At the end of the cell elements, the tab focus moves to the next `Age` header cell
- Use <kbd>⇧ Shift</kbd>+<kbd>⇥ Tab</kbd> to navigate in the reverse direction

The `suppressHeaderKeyboardEvent` callback is used to capture tab events and determine if the user is tabbing forward or backwards. It also suppresses the default behaviour of moving to the next cell if tabbing within the child elements. 

If the focus is at the beginning or the end of the cell children and moving out of the cell, the keyboard event is not suppressed, so focus can move between the children elements. Also, when moving backwards, the focus needs to be manually set while preventing the default behaviour of the keyboard press event.

<grid-example title='Custom Header Keyboard Navigation' name='header-component-keyboard-navigation' type='mixed'></grid-example>

## Provided Component

Most applications will use the Provided Header Component. It provides functionality such as Sorting, Filtering and Column Menu.

### Changing Template

You can provide an HTML template to the Default Header Component for simple layout changes. This is the default template used in AG Grid:

```html
<div class="ag-cell-label-container" role="presentation">
    <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button" aria-hidden="true"></span>
    <div ref="eLabel" class="ag-header-cell-label" role="presentation">
        <span ref="eText" class="ag-header-cell-text"></span>
        <span ref="eFilter" class="ag-header-icon ag-header-label-icon ag-filter-icon" aria-hidden="true"></span>
        <span ref="eSortOrder" class="ag-header-icon ag-header-label-icon ag-sort-order" aria-hidden="true"></span>
        <span ref="eSortAsc" class="ag-header-icon ag-header-label-icon ag-sort-ascending-icon" aria-hidden="true"></span>
        <span ref="eSortDesc" class="ag-header-icon ag-header-label-icon ag-sort-descending-icon" aria-hidden="true"></span>
        <span ref="eSortNone" class="ag-header-icon ag-header-label-icon ag-sort-none-icon" aria-hidden="true"></span>
    </div>
</div>
```

When you provide your own template, everything should work as expected as long as you re-use the same `refs`.

| Ref | Description |
|-|-|
| `eMenu` | The container where the column menu icon will appear to enable opening the column menu. |
| `eLabel` | The container where there is going to be an onClick mouse listener to trigger the sort. |
| `eText` | The text displayed on the column. |
| `eFilter` | The container with the icon that will appear if the user filters this column. |
| `eSortOrder` | In case of sorting on multiple columns, this shows the index that represents the position of this column in the order. |
| `eSortAsc` | In case of sorting ascending the data in the column, this shows the associated icon. |
| `eSortDesc` | In case of sorting descending the data in the column, this shows the descending icon. |
| `eSortNone` | In case of no sort being applied, this shows the associated icon. Note this icon by default is empty. |

The ref parameters are used by the grid to identify elements to add functionality to. If you leave an element out of your template, the functionality will not be added. For example if you do not specify `eLabel` then the column will not react to click events for sorting.

<note>
Templates are not meant to let you configure icons. If you are looking to change the icons, check our [icon docs](../custom-icons/).
</note>

Set the template using `colDef.headerComponentParams`. Set on the grid options `defaultColDef` to set for all Columns.

<snippet>
const gridOptions = {
    defaultColDef: {
        width: 100,
        headerComponentParams: {
            template:
                '&lt;div class="ag-cell-label-container" role="presentation"&gt;' +
                '  &lt;span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"&gt;&lt;/span&gt;' +
                '  &lt;div ref="eLabel" class="ag-header-cell-label" role="presentation"&gt;' +
                '    &lt;span ref="eSortOrder" class="ag-header-icon ag-sort-order"&gt;&lt;/span&gt;' +
                '    &lt;span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon"&gt;&lt;/span&gt;' +
                '    &lt;span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon"&gt;&lt;/span&gt;' +
                '    &lt;span ref="eSortNone" class="ag-header-icon ag-sort-none-icon"&gt;&lt;/span&gt;' +
                '    ** &lt;span ref="eText" class="ag-header-cell-text" role="columnheader"&gt;&lt;/span&gt;' +
                '    &lt;span ref="eFilter" class="ag-header-icon ag-filter-icon"&gt;&lt;/span&gt;' +
                '  &lt;/div&gt;' +
                '&lt;/div&gt;'
        }
    }
}
</snippet>

Note that specifying your own templates is compatible with other configurations:

- `suppressMenu` is specified in: **Athlete**, **Country**, **Date** and **Bronze** columns
- `sortable=false` is specified in: **Age**, **Year**, **Sport**, **Silver** and **Total** columns
- **Gold** is the only column that doesn't have `sortable=false` or `suppressMenu`

<grid-example title='Header template' name='header-template' type='generated' options='{ "extras": ["fontawesome"] }'></grid-example>

## Header Height

These properties can be used to change the different heights used in the headers.

<api-documentation source="grid-options/properties.json" section="headers"></api-documentation>

## Text Orientation

By default, the text label for the header is display horizontally, i.e. as normal readable text. To display the text in another orientation you have to provide your own CSS to change the orientation and also provide the adequate header heights using the appropriate grid property.

### Example: Header Height and Text Orientation

The following example shows how you can provide a unique look and feel to the headers. Note that:

- The header heights have all been changed via grid options:

<snippet spaceBetweenProperties="true">
    const gridOptions = {
        // Group columns
        groupHeaderHeight: 75,
        // Label columns
        headerHeight: 150,
        // Floating filter
        floatingFiltersHeight: 50,
        // Pivoting, requires turning on pivot mode. Label columns
        pivotHeaderHeight: 100,
        // Pivoting, requires turning on pivot mode. Group columns
        pivotGroupHeaderHeight: 50,
    }
</snippet>

- The grouped column header `Athlete Details` has a specific style applied to it to make it bigger. Note that the style is slightly different depending if pivoting or not:

```css
.ag-pivot-off .ag-header-group-cell {
    font-size: 50px;
    color: red;
}

.ag-pivot-on .ag-header-group-cell {
    font-size: 25px;
    color: green;
}
```

- The column labels have CSS applied to them so they are displayed vertically.

```css
.ag-header-cell-label {
    /* Necessary to allow for text to grow vertically */
    height: 100%;
    padding: 0 !important;
}

.ag-header-cell-label .ag-header-cell-text {
    /* Force the width corresponding to how much width
    we need once the text is laid out vertically */
    width: 30px;
    transform: rotate(90deg);
    margin-top: 50px;
    /* Since we are rotating a span */
    display: inline-block;
}
```

- The floating filters are using a much bigger area and the font used is bigger and bolder.

```css
.ag-floating-filter-body input {
    height: 49px;
}

.ag-floating-filter-button {
    margin-top: -49px;
}

.ag-floating-filter-button button {
    height: 49px
}

.ag-floating-filter-body input {
    font-size: 15px;
    font-weight: bold;
}
```

- The styling of the column labels have also been tweaked depending if pivoting or not.

```css
.ag-pivot-off .ag-header-cell-label {
    color: #8a6d3b;
}

.ag-pivot-on .ag-header-cell-label {
    color: #1b6d85;
    font-weight: bold;
}
```

<grid-example title='Header Height and Text Orientation' name='text-orientation' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping"]}'></grid-example>

## Dynamic Header Heights

As you can see in the example below, if you change any of the header heights, this change will be reflected automatically. Note how if the value is cleared (set to `undefined`), it might reuse other values. To see all the interactions check the properties descriptions at the top of the page.

<grid-example title='Dynamic Header Height' name='dynamic-height' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Auto Header Height

The column header row can have its height set automatically based on the content of the header cells. This is most useful when used together with [Custom Header Components](/column-headers/#custom-component/) or when using the `wrapHeaderText` column property.

To enable this, set `autoHeaderHeight=true` on the column definition you want to adjust the header height for. If more than one column has this property enabled, then the header row will be sized to the maximum of these
column's header cells so no content overflows.

The example below demonstrates using the `autoHeaderHeight` property in conjunction with the `wrapHeaderText` property, so that long column names are fully displayed.

- Note that the long column header names wrap onto another line
- Try making a column smaller by dragging the resize handle on the column header, observe that the header will expand so the full header content is still visible.

<note>
When `autoHeaderHeight=true` the Grid automatically disables Span Header Height, see: [Suppress Span Header Height](../column-groups/#suppress-span-header-height).
</note>

<grid-example title='Auto Header Height' name='auto-height' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping"] }'></grid-example>
