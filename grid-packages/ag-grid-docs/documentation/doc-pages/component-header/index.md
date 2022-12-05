---
title: "Header Components"
---

You can specify what header renderer to use at the column definition level. If not specified, the grid's default header rendering components will be used. If you just want to make simple layout changes to the default header take a look at [Header Templates](/column-headers/#header-templates).

There are two types of header components:

- **Header Component**: For rendering the normal column headers. Configured for columns.
- **Header Group Component**: For rendering column groups. Configured for column groups.

## Simple Header Component

md-include:simple-header-javascript.md
md-include:simple-header-angular.md
md-include:simple-header-react.md
md-include:simple-header-vue.md

## Example: Custom Header Component

The example below shows a header component in action. The following can be observed in the demo:

- Column moving and resizing is working without requiring any logic in the header component.
- Some columns have `suppressMenu=true`, so the header component doesn't show the menu.
- Some columns have `sortable=false`, so the header component doesn't add sorting logic.
- The header component uses additional parameters to allowing configuring the menu icon.

<grid-example title='Header component' name='header-component' type='generated' options='{ "extras": ["fontawesome"] }'></grid-example>

md-include:component-interface-javascript.md
md-include:component-interface-angular.md
md-include:component-interface-react.md
md-include:component-interface-vue.md

<interface-documentation interfaceName='IHeaderParams' ></interface-documentation>

## Specifying Header Components 

You specify the Header Component, as well Header Group Components, in the column definition (or you can set in the default column definition to impact all columns).

If you're not familiar with registering Custom Components for use within the Grid please refer the the [Registering Components](../components/) documentation first.

In the definitions below we're registering both a column `headerComponent` (for the `Age` column), as well as a `headerGroupComponent` (for the `Medals` grouped column).

md-include:column-def-javascript.md
md-include:column-def-angular.md
md-include:column-def-react.md
md-include:column-def-vue.md

For more information on declaring columns please refer to the [Column Definition Docs](../column-definitions/), and for grouped columns
please refer to the [Grouped Column Definition Docs](../column-groups/).

### Grid vs Your Responsibilities

A Header Component allows customising the inside part of the header. The component is wrapped inside a header cell so that the grid can take care of some complex logic that you should not be worried about, eg the resizing and moving of columns. The HTML of the header cell is similar to the following:
 
```html
    <!-- the ag-header-cell is always provided by AG Grid -->
    <!-- column moving and resize logic is put on this element by the grid -->
    <div class="ag-header-cell">

    <!-- AG Grid will also always provide a resize bar (if column resizing
    is enabled) and take care of all the resize logic. the grid usually
    floats this element to the right.-->
    <div class="ag-header-cell-resize"></div>

    <!-- checkbox for selection, if turned on.
    the grid usually floats this element to the left. -->
    <div class="ag-header-select-all"></div>

    <!-- the header component - this is the piece that you can customise -->
    <div class="ag-header-component"></div>
```

The grid is always responsible for the following:

- [**Resizing:**](/column-sizing/) When enabled, the grid will put an invisible widget to be grabbed by the mouse for resizing.
- [**Checkbox Selection:**](/row-selection/) When enabled, the grid puts a checkbox for 'select all' in the header.

The header component (your bit) will be responsible for the following:

- **Sorting:** You will need to process user interaction for sorting. The default grid component sorts when the user clicks the header with the mouse. You may also need to display icons as the sort state of the column changes.
- **Filtering:** You do not filter via the column (you filter from inside the menu), however you may need to display icons as the filter state of the column changes.
- **Menu:** If you want the user to be able to open the column menu, you will need to manage this user interaction. The default grid component provides a button for the user to click to show the menu.
- **Anything Else:** Whatever you want, you are probably creating a custom header to add your own functionality in.


### Sorting

How you interact with the user for sorting (eg do you listen for mouse clicks?) is up to you. The grid helps you by providing column state and events for getting and setting the sort.

After the user requests a sort, you should call ONE of the following:

[[only-javascript-or-angular-or-vue]]
| 1. `params.progressSort(multiSort):` This is the simplest. Call it to progress the sort on the column to the next stage. Using this uses the grid logic for working out what the next sort stage is (eg 'descending' normally follows 'ascending').
| 1. `params.setSort(direction, multiSort):` Use this to set to sort to a specific state. Use this if you don't want to use the grids logic for working out the next sort state.

[[only-react]]
| 1. `props.progressSort(multiSort):` This is the simplest. Call it to progress the sort on the column to the next stage. Using this uses the grid logic for working out what the next sort stage is (eg 'descending' normally follows 'ascending').
| 1. `props.setSort(direction, multiSort):` Use this to set to sort to a specific state. Use this if you don't want to use the grids logic for working out the next sort state.


[[only-javascript]]
| ```js
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
| ```

[[only-angular-or-vue]]
| ```js
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
| ```

[[only-react]]
| ```js
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
| ```

To know when a column's sort state has change (eg when to update your icons), you should listen for `sortChanged` event on the column.


```js
// listen to the column for sort events
column.addEventListener('sortChanged', function() {

    // get sort state from column
    var sort = column.getSort();
    console.log('sort state of column is ' + sort); // prints one of ['asc',desc',null]

    // then do what you need, eg set relevant icons visible
    var sortingAscending = sort==='asc';
    var sortingDescending = sort==='desc';
    var notSorting = !sortingAscending && !sortingDescending;
    // how you update your GUI accordingly is up to you
});

// don't forget to remove your listener in your destroy code
```

### Filtering

The header doesn't normally initiate filtering. If it does, use the standard grid API to set the filter. The header will typically display icons when the filter is applied. To know when to show a filter icon, listen to the column for filterChanged events.

```js
// listen to the column for filter events
column.addEventListener('filterChanged', function() {
    // when filter changes on the col, this will print one of [true,false]
    console.log('filter of column is ' + column.isFilterActive());
});

// don't forget to remove your listener in your destroy code
```

### Menu

How you get the user to ask for the column menu is up to you. When you want to display the menu, call the `params.showColumnMenu()` callback. The callback takes the HTML element for the button so that it can place the menu over the button (so the menu appears to drop down from the button).

[[only-javascript]]
| ```js
| myMenuButton.addEventListener('click', function() {
|     params.showColumnMenu(myMenuButton);
| });
| ```
[[only-vue]]
| ```js
| onMenuClicked() {
|     this.params.showColumnMenu(this.$refs.menuButton);
| });
| ```
[[only-angular]]
| ```js
| onMenuClicked() {
|     this.params.showColumnMenu(this.menuButton.nativeElement);
| });
| ```
[[only-react]]
| ```js
| onMenuClicked() {
|     this.props.showColumnMenu(refButton.current);
| });
| ```

### Refresh

The `refresh(params)` method gets called when the application updates the Column Definitions. For example the application could set a `headerName` attribute and then set the Column Definitions again. In this instance, the Header Component should update the displayed header name.

It is the responsibility of the Header Component to inspect the Column Definition for relevant changes and updated if needed. If the refresh was successful then `true` should be returned. If the refresh was not successful then `false` should be returned. If `false` is returned, then the grid will destroy and recreate the component. This pattern is consistent with the `refresh` method of Cell Renderers.

[[only-react]]
|[[note]]
||Implementing `refresh` is entirely optional - if you omit it then the `props` of the Custom Header Component will get updated when changes occur
||as per the normal React lifecycle.

### Complementing Params

On top of the parameters provided by the grid, you can also provide your own parameters. This is useful if you want to 'configure' your header component. For example, you might have a header component for formatting currency but that needs the currency symbol.

[[only-javascript]]
|```js
|colDef = {
|    ...
|    headerComponent: MyHeaderComponent;
|    headerComponentParams : {
|        currencySymbol: '£' // the pound symbol will be placed into params
|    }
|}
|```
[[only-angular]]
|```js
|colDef = {
|    ...
|    headerComponent: MyHeaderComponent;
|    headerComponentParams : {
|        currencySymbol: '£' // the pound symbol will be placed into params
|    }
|}
|```
[[only-react]]
|```js
|colDef = {
|    ...
|    headerComponent: MyHeaderComponent;
|    headerComponentParams : {
|        currencySymbol: '£' // the pound symbol will be placed into params
|    }
|}|```
[[only-vue]]
|```js
|colDef = {
|    ...
|    headerComponent: 'MyHeaderComponent';
|    headerComponentParams : {
|        currencySymbol: '£' // the pound symbol will be placed into params
|    }
|}
|```

## Header Group Components

### Grid vs Your Responsibilities

As with normal headers, AG Grid will always handle resize and column moving. The grid does not handle selection checkbox as this feature is only at the non-grouped header level. The header group component (your bit) is responsible for the following:

- **Group Open / Close:** If the group can expand (one or more columns visibility depends on the open / closed state of the group) then your header group component should handle the interaction with the user for opening and closing groups.
- **Anything Else:** Whatever you want, it's your component!

### Header Group Component Interface

md-include:group-component-interface-javascript.md
md-include:group-component-interface-angular.md
md-include:group-component-interface-react.md
md-include:group-component-interface-vue.md

<interface-documentation interfaceName='IHeaderGroupParams' ></interface-documentation>

md-include:open-close-javascript.md
md-include:open-close-angular.md
md-include:open-close-react.md
md-include:open-close-vue.md

### Example: Header Group Cells

<grid-example title='Header Group' name='header-group-component' type='generated' options='{ "extras": ["fontawesome"] }'></grid-example>

## Custom Header Keyboard Navigation

Within custom header renderers, keyboard navigation and focus can be handled by writing a custom `suppressHeaderKeyboardEvent` function in grid options.

An example of this is shown below, where the custom header elements are able to be traversed using <kbd>tab</kbd> and <kbd>shift</kbd>+<kbd>tab</kbd>:

- Click on the top left `Athlete` header, press the <kbd>tab</kbd> key and notice that the button, textbox and link in the `Country` header can be tabbed into. At the end of the cell elements, the tab focus moves to the next `Age` header cell
- Use <kbd>shift</kbd>+<kbd>tab</kbd> to navigate in the reverse direction

The `suppressHeaderKeyboardEvent` function is used to capture tab events and determine if the user is tabbing forward or backwards. It also suppresses the default behaviour of moving to the next cell if tabbing within the child elements. If the focus is at the beginning or the end of the cell children and moving out of the cell, the keyboard event is not suppressed, so focus can move between the children elements. Also, when moving backwards, the focus needs to be manually set while preventing the default behaviour of the keyboard press event.

<grid-example title='Custom Header Keyboard Navigation' name='header-component-keyboard-navigation' type='mixed'></grid-example>