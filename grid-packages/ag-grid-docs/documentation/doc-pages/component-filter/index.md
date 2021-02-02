---
title: "Filter Component"
---

Filter components allow you to add your own filter types to AG Grid. Use them when the provided filters do not meet your requirements.

## Filter Component Interface (**IFilterComp**)

```ts
interface IFilterComp {
    // Mandatory methods

    // The init(params) method is called on the filter once. See below for details on the
    // parameters.
    init(params: IFilterParams): void;

    // Returns the DOM element for this filter
    getGui(): HTMLElement;

    // Return true if the filter is active. If active then 1) the grid will show the filter icon in the column
    // header and 2) the filter will be included in the filtering of the data.
    isFilterActive(): boolean;

    // The grid will ask each active filter, in turn, whether each row in the grid passes. If any
    // filter fails, then the row will be excluded from the final set. A params object is supplied
    // containing attributes of node (the rowNode the grid creates that wraps the data) and data (the data
    // object that you provided to the grid for that row).
    doesFilterPass(params: IDoesFilterPassParams): boolean;

    // Gets the filter state. If filter is not active, then should return null/undefined.
    // The grid calls getModel() on all active filters when gridApi.getFilterModel() is called.
    getModel(): any;

    // Restores the filter state. Called by the grid after gridApi.setFilterModel(model) is called.
    // The grid will pass undefined/null to clear the filter.
    setModel(model: any): void;


    // Optional methods

    // Gets called every time the popup is shown, after the GUI returned in
    // getGui is attached to the DOM. If the filter popup is closed and re-opened, this method is
    // called each time the filter is shown. This is useful for any logic that requires attachment
    // before executing, such as putting focus on a particular DOM element. The params has one
    // callback method 'hidePopup', which you can call at any later point to hide the popup - good
    // if you have an 'Apply' button and you want to hide the popup after it is pressed.
    afterGuiAttached?(params?: { hidePopup?: Function }): void;

    // Gets called when new rows are inserted into the grid. If the filter needs to change its
    // state after rows are loaded, it can do it here. For example the set filters uses this
    // to update the list of available values to select from (e.g. 'Ireland', 'UK' etc for
    // Country filter).
    onNewRowsLoaded?(): void;

    // Gets called when the column is destroyed. If your custom filter needs to do
    // any resource cleaning up, do it here. A filter is NOT destroyed when it is
    // made 'not visible', as the GUI is kept to be shown again if the user selects
    // that filter again. The filter is destroyed when the column it is associated with is
    // destroyed, either when new columns are set into the grid, or the grid itself is destroyed.
    destroy?(): void;

    // If floating filters are turned on for the grid, but you have no floating filter
    // configured for this column, then the grid will check for this method. If this
    // method exists, then the grid will provide a read-only floating filter for you
    // and display the results of this method. For example, if your filter is a simple
    // filter with one string input value, you could just return the simple string
    // value here.
    getModelAsString?(model: any): string;
}
```

## IFilterParams

The method `init(params)` takes a `params` object with the items listed below. If the user provides params via the `colDef.filterParams` attribute, these will be additionally added to the `params` object, overriding items of the same name if a name clash exists.

```ts
interface IFilterParams {
    // The column this filter is for
    column: Column;

    // The column definition for the column
    colDef: ColDef;

    // The row model, helpful for looking up data values if needed.
    // If the filter needs to know which rows are a) in the table,
    // b) currently visible (i.e. not already filtered), c) which groups,
    // d) what order - all of this can be read from the rowModel.
    rowModel: IRowModel;

    // A function callback to be called when the filter changes. The
    // grid will then respond by filtering the grid data. The callback
    // takes one optional parameter which, if included, will get merged
    // to the FilterChangedEvent object (useful for passing additional
    // information to anyone listening to this event, however such extra
    // attributes are not used by the grid).
    filterChangedCallback: (additionalEventAttributes?: any) => void;

    // A function callback, to be optionally called, when the filter UI changes.
    // The grid will respond with emitting a FilterModifiedEvent. Apart from
    // emitting the event, the grid takes no further action.
    filterModifiedCallback: () => void;

    // A function callback for the filter to get cell values from the
    // row data. Call with a node to be given the value for that filter's
    // column for that node. The callback takes care of selecting the
    // right column definition and deciding whether to use valueGetter
    // or field etc. This is useful in, for example, creating an Excel
    // style filter, where the filter needs to lookup available values
    // to allow the user to select from.
    valueGetter: (rowNode: RowNode) => any;

    // A function callback, call with a node to be told whether the node
    // passes all filters except the current filter. This is useful if you
    // want to only present to the user values that this filter can filter
    // given the status of the other filters. The set filter uses this to
    // remove from the list, items that are no longer available due to the
    // state of other filters (like Excel type filtering).
    doesRowPassOtherFilter: (rowNode: RowNode) => boolean;

    // The context for this grid. See section on Context
    context: any;

    // The grid API
    api: any;

    // Only if using AngularJS (ie Angular v1), if angularCompileFilters
    // is set to true, then a new child scope is created for each column
    // filter and provided here.
    $scope: any;
}
```

### IDoesFilterPassParams

The method `doesFilterPass(params)` takes the following as a parameter:

```ts
interface IDoesFilterPassParams {
    // The row node in question
    node: RowNode;

    // The data part of the row node in question
    data: any;
}
```

### Associating Floating Filter

If you create your own filter you have two options to get floating filters working for that filter:

1. You can [create your own floating filter](../component-floating-filter/).
1. You can implement the method `getModelAsString()` in your custom filter. If you implement this method and don't provide a custom floating filter, AG Grid will automatically provide a read-only version of a floating filter.

If you don't provide either of these two options for your custom filter, the display area for the floating filter will be empty.

## Example: Custom Filter

The example below shows two custom filters. The first is on the Athlete column and the second is on the Year column.

<grid-example title='Filter Component' name='custom-filter' type='vanilla'></grid-example>

## Custom Filters Containing a Popup Element

Sometimes you will need to create custom components for your filters that also contain popup elements. This is the case for Date Filter as it pops up a Date Picker. If the library you use anchors the popup element outside of the parent filter, then when you click on it the grid will think you clicked outside of the filter and hence close the column menu.

There are two ways you can get fix this problem:

- Add a mouse click listener to your floating element and set it to `preventDefault()`. This way, the click event will not bubble up to the grid.<br /><br />Note: This is the best solution, but you can only do this if you are writing the component yourself.
- Add the `ag-custom-component-popup` CSS class to your floating element. An example of this usage can be found here: [Custom Date Component](../component-date/#example-custom-date)

[[only-angular]]
| ## Angular Filtering
|
| It is possible to provide Angular filters for AG Grid to use if you are are using the Angular version of AG Grid.
| See [registering framework components](../components/#registering-framework-components) for how to register
| framework components.
|
| Your Angular components need to implement `AgFilterComponent`. The ag Framework expects to find the mandatory
| methods on the interface on the created component (and will call optional methods if they're present).
|
| ### Angular Params
|
| The ag Framework expects to find the `agInit` (on the `AgFilterComponent` interface) method on the created
| component, and uses it to supply the 'filter params'.
|
| ```ts
| agInit(params: IFilterParams): void {
|     this.params = params;
|     this.valueGetter = params.valueGetter;
| }
| ```
|
| ### Angular Methods / Lifecycle
|
| All of the methods in the `IFilterComp` interface described above are applicable to the Component with
| the following exceptions:
|
| - `init()` is not used. Instead implement the `agInit` method (on the `AgRendererComponent` interface).
| - `destroy()` is not used. Instead implement the Angular `OnDestroy` interface (`ngOnDestroy`) for any cleanup you need to do.
| - `getGui()` is not used. Angular will provide the GUI via the supplied template.
|
| After that, all the other methods (`onNewRowsLoaded()`, `getModel()`, `setModel()` etc.) behave the same,
| so put them directly onto your Angular Component.
|
| ### Accessing the Angular Component Instance
|
| AG Grid allows you to get a reference to the filter instances via the `api.getFilterInstance(colKey)` method.
| If your component is a Angular component, this will give you a reference to AG Grid's component which wraps your
| Angular component, just like Russian Dolls. To get to the wrapped Angular instance of your component, use the
| `getFrameworkComponentInstance()` method as follows:
|
|
| ```ts
| // let's assume an Angular component as follows
| @Component({
|     selector: 'filter-cell',
|     template: `
|         Filter: <input style="height: 10px" #input (ngModelChange)="onChange($event)" [ngModel]="text">
|     `
| })
| class PartialMatchFilterComponent implements AgFilterComponent {
|     ... // standard filter methods hidden
|
|     // put a custom method on the filter
|     myMethod() {
|         // does something
|     }
| }
|
| // later in your app, if you want to execute myMethod()...
| laterOnInYourApplicationSomewhere() {
|     // get reference to the AG Grid Filter component
|     const agGridFilter = api.getFilterInstance('name'); // assume filter on name column
|
|     // get Angular instance from the AG Grid instance
|     const angularFilterInstance = agGridFilter.getFrameworkComponentInstance();
|
|     // now we're sucking diesel!!!
|     angularFilterInstance.myMethod();
| }
| ```
|
| ### Example: Filtering using Angular Components
|
| Using Angular Components as a partial text filter in the Name column, illustrating filtering and lifecycle events.
|
|
| <grid-example title='Angular Filter Component' name='filter-component' type='generated' options='{ "enterprise": false, "exampleHeight": 445, "onlyShow": "angular", "extras": ["bootstrap"] }'></grid-example>

[[only-react]]
| ## React Filtering
|
| It is possible to provide React filters for AG Grid to use if you are are using the React version of AG Grid.
| See [registering framework components](../components/#registering-framework-components) for how to register
| framework components.
|
| ###  React Props
|
| The React component will get the 'filter params' as described above as React Props. Therefore you can access all
| the parameters as React Props.
|
|
| ```ts
| // React filter Component
| class NameFilter extends React.Component {
|     constructor(props) {
|         super(props);
|         // from here you can access any of the props!
|         console.log('The field for this filter is ' + props.colDef.field);
|     }
|
|     // maybe your filter has a button in it, and when it gets clicked...
|     onButtonWasPressed() {
|         // all the methods in the props can be called
|         this.props.filterChangedCallback();
|     }
| }
| ```
|
| ### React Methods / Lifecycle
|
| All of the methods in the `IFilterComp` interface described above are applicable to the React Component with the following
| exceptions:
|
| - `init()` is not used. Instead use the React props passed to your Component.
| - `destroy()` is not used. Instead use the React `componentWillUnmount()` method for any cleanup you need to do.
| - `getGui()` is not used. Instead use normal React magic in your `render()` method.
|
| After that, all the other methods (`onNewRowsLoaded()`, `getModel()`, `setModel()` etc.) behave the same, so put them directly | onto your React Component.
|
| ### Accessing the React Component Instance
|
| AG Grid allows you to get a reference to the filter instances via `api.getFilterInstance(colKey, callback)`. React components | are created asynchronously, so it is necessary to use a callback rather than relying on the return value of this method. If
| your component is a React component, this will give you a reference to AG Grid's component which wraps your React component, | just like Russian Dolls. To get to the wrapped React instance of your component, use the `getFrameworkComponentInstance()`
| method as follows:
|
| ```ts
| // let's assume a React component as follows
| class NameFilter extends React.Component {
|     ... // standard filter methods hidden
|
|     // put a custom method on the filter
|     myMethod() {
|         // does something
|     }
| }
|
| // later in your app, if you want to execute myMethod()...
| laterOnInYourApplicationSomewhere() {
|     // get reference to the AG Grid Filter component on name column
|     api.getFilterInstance('name', agGridFilterInstance => {
|         // get React instance from the AG Grid instance
|         var reactFilterInstance = agGridFilterInstance.getFrameworkComponentInstance();
|
|         // now we're sucking diesel!!!
|         reactFilterInstance.myMethod();
|     });
| }
| ```
|
| ###  Example: Filtering using React Components
|
| Using React Components as a partial text filter in the Name column, illustrating filtering and lifecycle events.
|
| <grid-example title='React Filter Component' name='filter-component' type='generated' options='{ "enterprise": false, "exampleHeight": 445, "extras": ["bootstrap"] }'></grid-example>
|
| Note that in this example we make use of `useImperativeHandle` for lifecycle methods - please see
| [here](../react-hooks/) for more information.
|

[[only-vue]]
| ## VueJS Filtering
|
| It is possible to provide VueJS filters for AG Grid to use if you are are using the VueJS version of AG Grid.
| See [registering framework components](../components/#registering-framework-components) for how to register
| framework components.
|
| ###  VueJS Params
|
| The 'filter params' will be made available implicitly in a data value named `params`. This value will be available
| to you from the `created` VueJS lifecycle hook.
|
| You can think of this as you having defined the following:
|
| ```ts
| export default {
|     data () {
|         return {
|             params: null
|         }
|     },
|     ...
| }
| ```
|
| but you do not need to do this - it is made available to you behind the scenes, and contains the cell's value.
|
| ### VueJS Methods / Lifecycle
|
| All of the methods in the `IFilterComp` interface described above are applicable to the VueJS Component with
| the following exceptions:
|
| - `init()` is not used. The cell's value is made available implicitly via a data field called `params`.
| - `getGui()` is not used. VueJS will provide the GUI via the supplied template.
|
| After that, all the other methods (`onNewRowsLoaded()`, `getModel()`, `setModel()` etc.) behave the same, so
| put them directly onto your VueJS Component.
|
| ### Accessing the VueJS Component Instance
|
| AG Grid allows you to get a reference to the filter instances via the `api.getFilterInstance(colKey)` method.
| If your component is a VueJS component, then this will give you a reference to AG Grid's component which wraps
| your VueJS component, just like Russian Dolls. To get to the wrapped VueJS instance of your component, use
| the `getFrameworkComponentInstance()` method as follows:
|
| ```ts
| // let's assume a VueJS component as follows
| export default Vue.extend({
|     template: `<input style="height: 20px" :ref="'input'" v-model="text">`,
|     data() {
|         ...data
|     },
|     methods: {
|         myMethod() {
|             // does something
|         },
|         ...other methods
|     },
|
|     // later in your app, if you want to execute myMethod()...
|     laterOnInYourApplicationSomewhere() {
|         // get reference to the AG Grid Filter component
|         const agGridFilterInstance = api.getFilterInstance('name'); // assume filter on name column
|
|         // get VueJS instance from the AG Grid instance
|         const vueFilterInstance = agGridFilterInstance.getFrameworkComponentInstance();
|
|         // now we're sucking diesel!!!
|         vueFilterInstance.myMethod();
|     }
| ```
| <grid-example title='Vue Filter Component' name='filter-component' type='generated' options='{ "enterprise": false, "exampleHeight": 445, "onlyShow": "vue", "extras": ["bootstrap"] }'></grid-example>
