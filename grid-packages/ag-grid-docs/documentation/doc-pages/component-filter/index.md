---
title: "Filter Component"
---

Filter components allow you to add your own filter types to AG Grid. Use them when the provided filters do not meet your requirements.

## Simple Filter

md-include:simple-filter-javascript.md
md-include:simple-filter-angular.md
md-include:simple-filter-react.md
md-include:simple-filter-vue.md

## Custom Filter Example

The example below shows two custom filters. The first is on the `Athlete` column and demonstrates a filter with "fuzzy" matching and the
second is on the `Year` column and uses the `YearFilter` above.

<grid-example title='Filter Component' name='custom-filter' type='generated'></grid-example>

md-include:component-interface-javascript.md
md-include:component-interface-angular.md
md-include:component-interface-react.md
md-include:component-interface-vue.md

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

## Associating Floating Filter

If you create your own filter you have two options to get floating filters working for that filter:

1. You can [create your own floating filter](/component-floating-filter/).
1. You can implement the `getModelAsString()` method in your custom filter. If you implement this method and don't provide a custom floating filter, AG Grid will automatically provide a read-only version of a floating filter.

If you don't provide either of these two options for your custom filter, the display area for the floating filter will be empty.

## Custom Filters Containing a Popup Element

Sometimes you will need to create custom components for your filters that also contain popup elements. This is the case for Date Filter as it pops up a Date Picker. If the library you use anchors the popup element outside of the parent filter, then when you click on it the grid will think you clicked outside of the filter and hence close the column menu.

There are two ways you can get fix this problem:

- Add a mouse click listener to your floating element and set it to `preventDefault()`. This way, the click event will not bubble up to the grid.
  This is the best solution, but you can only do this if you are writing the component yourself.
- Add the `ag-custom-component-popup` CSS class to your floating element. An example of this usage can be found here: [Custom Date Component](/component-date/#example-custom-date)

[[only-angular]]
| ## Accessing the Angular Component Instance
|
| AG Grid allows you to get a reference to the filter instances via the `api.getFilterInstance(colKey)` method.
| If your component is a Angular component, this will give you a reference to AG Grid's component which wraps your
| Angular component, just like Russian Dolls. To get to the wrapped Angular instance of your component, use the
| `getFrameworkComponentInstance()` method as follows:
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
| The example below illustrates how a custom filter component can be accessed and methods on it invoked:
|
| <grid-example title='Angular Filter Component' name='filter-component' type='generated' options='{ "enterprise": false, "exampleHeight": 445, "onlyShow": "angular", "extras": ["bootstrap"] }'></grid-example>

[[only-react]]
| ## Accessing the React Component Instance
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
| The example below illustrates how a custom filter component can be accessed and methods on it invoked:
|
| <grid-example title='React Filter Component' name='filter-component' type='generated' options='{ "enterprise": false, "exampleHeight": 445, "extras": ["bootstrap"] }'></grid-example>
|
[[only-vue]]
| ## Accessing the VueJS Component Instance
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
|
| The example below illustrates how a custom filter component can be accessed and methods on it invoked:
|
| <grid-example title='Vue Filter Component' name='filter-component' type='generated' options='{ "enterprise": false, "exampleHeight": 445, "onlyShow": "vue", "extras": ["bootstrap"] }'></grid-example>

