---
title: "Header Components"
---

You can specify what header renderer to use at the column definition level. If not specified, the grid's default header rendering components will be used.

There are two types of header components:

- **Header Component**: For rendering the normal column headers. Configured for columns.
- **Header Group Component**: For rendering column groups. Configured for column groups.

You specify the header component to use in the column definition (or you can set in the default column definition to impact all columns).

```js
// a list of column definitions
var myColumns = {

    // these columns use the default header
    {headerName: "Athlete", field: "athlete"},
    {headerName: "Sport", field: "sport"},

    // this column uses a custom header
    {headerName: "Age", field: "age", headerComponent: MyHeaderComponent},

    // you can also specify header components for groups
    {
        headerName: "Medals",
        // custom header component
        headerGroupComponent: MyHeaderGroupComponent,
        children: [
            {headerName: "Gold", field: "gold"},
            {headerName: "Silver", field: "silver"},
            {headerName: "Gold", field: "bronze"}
        ]
    }
}
```

## Header Component

This section details how to put a header component into AG Grid. How to create header group components is explained in the next section.

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

- [**Resizing:**](../column-sizing/) When enabled, the grid will put an invisible widget to be grabbed by the mouse for resizing.
- [**Checkbox Selection:**](../row-selection/) When enabled, the grid puts a checkbox for 'select all' in the header.

The header component (your bit) will be responsible for the following:

- **Sorting:** You will need to process user interaction for sorting. The default grid component sorts when the user clicks the header with the mouse. You may also need to display icons as the sort state of the column changes.
- **Filtering:** You do not filter via the column (you filter from inside the menu), however you may need to display icons as the filter state of the column changes.
- **Menu:** If you want the user to be able to open the column menu, you will need to manage this user interaction. The default grid component provides a button for the user to click to show the menu.
- **Anything Else:** Whatever you want, you are probably creating a custom header to add your own functionality in.

### Header Component Interface

Header components work similar to other component types in AG Grid in which they should implement the following interface:

```ts
interface IHeaderComp {

// optional method, gets called once with params
init?(params: IHeaderCompParams): void;

// can get called more than once, you should return the HTML element
getGui(): HTMLElement;

// gets called when a new Column Definition has been set for this header
refresh(params: IHeaderCompParams): HTMLElement;

// optional method, gets called once, when component is destroyed
destroy?(): void;

}
```

The params passed to `init()` are as follows:

```ts
interface IHeaderCompParams {
    // the column the header is for
    column: Column;

    // the name to display for the column. if the column is using a headerValueGetter,
    // the displayName will take this into account.
    displayName: string;

    // whether sorting is enabled for the column. only put sort logic into
    // your header if this is true.
    enableSorting: boolean;

    // whether menu is enabled for the column. only display a menu button
    // in your header if this is true.
    enableMenu: boolean;

    // the header the grid provides. the custom header component is a child of the grid provided
    // header. the grid's header component is what contains the grid managed functionality such as
    // resizing, keyboard navigation etc. this is provided should you want to make changes to this
    // cell, eg add ARIA tags, or add keyboard event listener (as focus goes here when navigating
    // to the header).
    eGridHeader: HTMLElement;

    // callback to progress the sort for this column.
    // the grid will decide the next sort direction eg ascending, descending or 'no sort'.
    // pass multiSort=true if you want to do a multi sort (eg user has shift held down when
    // they click)
    progressSort(multiSort: boolean): void;

    // callback to set the sort for this column.
    // pass the sort direction to use ignoring the current sort eg one of 'asc', 'desc' or null
    // (for no sort). pass multiSort=true if you want to do a multi sort (eg user has shift held
    // down when they click)
    setSort(sort: string, multiSort?: boolean): void;

    // callback to request the grid to show the column menu.
    // pass in the html element of the column menu to have the
    // grid position the menu over the button.
    showColumnMenu(menuButton: HTMLElement): void;

    // The grid API
    api: any;
}
```

### Sorting

How you interact with the user for sorting (eg do you listen for mouse clicks?) is up to you. The grid helps you by providing column state and events for getting and setting the sort.

After the user requests a sort, you should call ONE of the following:

1. `params.progressSort(multiSort):` This is the simplest. Call it to progress the sort on the column to the next stage. Using this uses the grid logic for working out what the next sort stage is (eg 'descending' normally follows 'ascending').
1. `params.setSort(direction, multiSort):` Use this to set to sort to a specific state. Use this if you don't want to use the grids logic for working out the next sort state.

```js
// option 1) tell the grid when you want to progress the sorting
myHeaderElement.addEventListener('click', function(event) {
    // in this example, we do multi sort if shift key is pressed
    params.progressSort(event.shiftKey);
});

// or option 2) tell the grid when you want to set the sort explicitly
// button that always sorts ASCENDING
mySortAscButton.addEventListener('click', function(event) {
    params.setSort('asc', event.shiftKey);
});

// button that always sorts DESCENDING
mySortDescButton.addEventListener('click', function(event) {
    params.setSort('desc', event.shiftKey);
});
```

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

```js
myMenuButton.addEventListener('click', function() {
    params.showColumnMenu(myMenuButton);
});
```

### Refresh

The `refresh(params)` method gets called when the application updates the Column Definitions. For example the application could set a `headerName` attribute and then set the Column Definitions again. In this instance, the Header Component should update the displayed header name.

It is the responsibility of the Header Component to inspect the Column Definition for relevant changes and updated if needed. If the refresh was successful then `true` should be returned. If the refresh was no successful then `false` should be returned. If `false` is returned, then the grid will destroy and recreate the component. This pattern is consistent with the `refresh` method of Cell Renderers.

### Complementing Params

On top of the parameters provided by the grid, you can also provide your own parameters. This is useful if you want to 'configure' your header component. For example, you might have a header component for formatting currency but that needs the currency symbol.

```js
colDef = {
    ...
    headerComponent: MyHeaderComponent;
    headerComponentParams : {
        currencySymbol: '£' // the pound symbol will be placed into params
    }
}
```

### Example: Header Component

The example below shows a header component in action. The following can be observed in the demo:

- Column moving and resizing is working without requiring any logic in the header component.
- Some columns have suppressMenu=true, so the header component doesn't show the menu.
- Some columns have sortable=false, so the header component doesn't add sorting logic.
- The header component uses additional parameters to allowing configuring the menu icon.

[[only-angular]]
| ##  Angular Header Component
|
| ### Header Component
|
| Implementing a header component in Angular differs from the standard header component in the following ways:
|
| - Implement `IHeaderAngularComp` instead of `IHeaderComp`.
| - Use `colDef.headerComponentFramework` instead of `colDef.headerComponent`.
|
| The interface `IHeaderAngularComp` is as follows:
|
| ```ts
| interface IHeaderAngularComp {
|
|     // equivalent of init in IHeaderComp
|     // IHeaderCompParams is same as non Angular version
|     agInit?(params: IHeaderCompParams): void;
|
|     // no getGui() or destroy(), all handled by Angular
| }
| ```
|
| For a full working example of Header Components in Angular see
| [Angular Example](https://github.com/ag-grid/ag-grid-angular-cli-example).

[[only-react]]
| ## React Header Rendering
|
| ### Header Component
|
| Implementing a header component in React differs from the standard header component in the following ways:
|
| - Implement `IHeaderReactComp` instead of `IHeaderComp`.
| - Use `colDef.headerComponentFramework` instead of `colDef.headerComponent`.
|
| The interface `IHeaderReactComp` is empty. The params object (IHeaderCompParams) is passed as a constructor to your React
| component.
|
| For a full working example of Header Components in React see
| [React Example](https://github.com/ag-grid/ag-grid-react-example).
|
| Note that in this example we make use of `useImperativeHandle` for lifecycle methods - please see [here](../react-hooks/) for more information.

[[only-vue]]
| ## VueJS Header Rendering
|
| ### Header Component
|
| Implementing a header component in VueJS differs from the standard header component in it's much easier!
|
| All you need to do is implement your VueJS component as normal, and provide it to the grid as documented above. Easy!

<grid-example title='Header component' name='header-component' type='generated' options='{ "extras": ["fontawesome"] }'></grid-example>

This section details how to put a header group component into AG Grid.
### Grid vs Your Responsibilities

As with normal headers, AG Grid will always handle resize and column moving. The grid does not handle selection checkbox as this feature is only at the non-grouped header level. The header group component (your bit) is responsible for the following:

- **Group Open / Close:** If the group can expand (one or more columns visibility depends on the open / closed state of the group) then your header group component should handle the interaction with the user for opening and closing groups.
- **Anything Else:** Whatever you want, it's your component!

### Header Group Component Interface

The header group component interface is almost identical to the above header component. The only difference is the params object passed to the `init()` method.

```ts
interface IHeaderGroupComp {
    // optional method, gets called once with params
    init?(params: IHeaderGroupCompParams): void;

    // can be called more than once, you should return the HTML element
    getGui(): HTMLElement;

    // optional method, gets called once, when component is destroyed
    destroy?(): void;
}
```

The params passed to `init()` are as follows:

```ts
interface IHeaderGroupParams
    // the column group the header is for
    columnGroup: ColumnGroup;

    // the text label to render. if the column is using a headerValueGetter,
    // the displayName will take this into account.
    displayName: string;

    // opens / closes the column group
    setExpanded(expanded: boolean): void;
}
```

[[only-angular]]
| Implementing a header group component in Angular differs from the standard header group component in the following ways:
|
| - Implement `IHeaderGroupAngularComp` instead of `IHeaderGroupComp`.
| - Use `colDef.headerGroupComponentFramework` instead of `colDef.headerGroupComponent`.
|
| The interface `IHeaderGroupAngularComp` is as follows:
|
| ```ts
| interface IHeaderGroupAngularComp {
|
|     // equivalent of init in IHeaderGroupComp,
|     // IHeaderGroupCompParams is same as non Angular version
|     agInit?(params: IHeaderGroupCompParams): void;
|
|     // no getGui() or destroy(), all handled by Angular
| }
| ```

[[only-react]]
| Implementing a header group component in React differs from the standard header group component in the following ways:
|
| - Implement `IHeaderGroupReactComp` instead of `IHeaderGroupComp`.
| - Use `colDef.headerGroupComponentFramework` instead of `colDef.headerGroupComponent`.
|
| The interface `IHeaderReactComp` is empty. The params object (IHeaderGroupCompParams) is passed as a constructor
| to your React component.

### Opening / Closing Groups

Not all column groups can open and close, so you should display open / close features accordingly. To check if a column group should have open / close functionality, check the `isExpandable()` method on the column group.

```js
var showExpandableIcons = params.columnGroup.isExpandable()
```

To check if a column group is open or closed, check the `isExpanded()` method on the column group.

```js
var groupIsOpen = params.columnGroup.isExpanded();
```

To open / close a column group, use the `params.setExpanded(boolean)` method.

```js
// this code toggles the expanded state
var oldValue = params.columnGroup.isExpanded();
var newValue = !oldValue;
params.setExpanded(newValue);
```

To know if a group is expanded or collapsed, listen for the `expandedChanged` event on the column group.

```js
// get a reference to the original column group
var columnGroup = params.columnGroup.getOriginalColumnGroup();
// create listener
var listener = function() { console.log('group was opened or closed'); };
// add listener
columnGroup.addEventListener('expandedChanged', listener);

// don't forget to remove the listener in your destroy method
columnGroup.removeEventListener('expandedChanged', listener);
```

### Example: Header Group Cells

<grid-example title='Header Group' name='header-group-component' type='generated' options='{ "extras": ["fontawesome"] }'></grid-example>
