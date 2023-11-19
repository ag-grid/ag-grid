---
title: "Filter Component"
---

<framework-specific-section frameworks="javascript,angular,vue">
|Filter components allow you to add your own filter types to AG Grid. Use them when the Provided Filters do not meet your requirements.
</framework-specific-section>

<framework-specific-section frameworks="react">
<video-section id="yO3_nTyDv6o" title="React Custom Filters" header="true">
Filter components allow you to add your own filter types to AG Grid. Use them when the Provided Filters do not meet your requirements.
</video-section>
</framework-specific-section>

The example below shows two custom filters. The first is on the `Athlete` column and demonstrates a filter with "fuzzy" matching and the
second is on the `Year` column with preset options.

<grid-example title='Filter Component' name='custom-filter' type='generated' options='{ "includeNgFormsModule" : true}'></grid-example>

md-include:component-interface-javascript.md
md-include:component-interface-angular.md
md-include:component-interface-react.md
md-include:component-interface-vue.md

<interface-documentation interfaceName='IFilterParams' ></interface-documentation>

### IDoesFilterPassParams

The method `doesFilterPass(params)` takes the following as a parameter:

<interface-documentation interfaceName='IDoesFilterPassParams' ></interface-documentation>


## Associating Floating Filter

If you create your own filter you have two options to get floating filters working for that filter:

1. You can [create your own floating filter](/component-floating-filter/).
1. You can implement the `getModelAsString()` method in your custom filter. If you implement this method and don't provide a custom floating filter, AG Grid will automatically provide a read-only version of a floating filter. See [Custom Filter And Read-Only Floating Filter](/component-floating-filter/#example-custom-filter-and-read-only-floating-filter).

If you don't provide either of these two options for your custom filter, the display area for the floating filter will be empty.

## Custom Filters Containing a Popup Element

Sometimes you will need to create custom components for your filters that also contain popup elements. This is the case for Date Filter as it pops up a Date Picker. If the library you use anchors the popup element outside of the parent filter, then when you click on it the grid will think you clicked outside of the filter and hence close the column menu.

There are two ways you can get fix this problem:

- Add a mouse click listener to your floating element and set it to `preventDefault()`. This way, the click event will not bubble up to the grid.
  This is the best solution, but you can only do this if you are writing the component yourself.
- Add the `ag-custom-component-popup` CSS class to your floating element. An example of this usage can be found here: [Custom Date Component](/component-date/#example-custom-date-component)

<framework-specific-section frameworks="angular">
| ## Accessing the Angular Component Instance
|
| AG Grid allows you to get a reference to the filter instances via the `api.getFilterInstance(colKey)` method.
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
| // let's assume an Angular component as follows
| @Component({
|     selector: 'filter-cell',
|     template: `
|         Filter: &lt;input style="height: 10px" #input (ngModelChange)="onChange($event)" [ngModel]="text">
|     `
| })
| class PartialMatchFilterComponent implements IFilterAngularComp {
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
|     const angularFilterInstance = api.getFilterInstance&lt;PartialMatchFilterComponent>('name'); // assume filter on name column
|     angularFilterInstance.myMethod();
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| The example below illustrates how a custom filter component can be accessed and methods on it invoked:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<grid-example title='Angular Filter Component' name='filter-component' type='mixed' options='{ "enterprise": false, "exampleHeight": 445, "onlyShow": "angular", "includeNgFormsModule" : true }'></grid-example>
</framework-specific-section>

<framework-specific-section frameworks="react">
| ## Accessing the React Component Instance
|
| AG Grid allows you to get a reference to the filter instances via `api.getFilterInstance(colKey, callback)`. React components are created asynchronously, so it is necessary to use a callback rather than relying on the return value of this method. 
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="ts">
|// let's assume a React component as follows
|export default forwardRef((props, ref) => {
|    useImperativeHandle(ref, () => {
|        return {
|            ... // required filter methods
|
|            // put a custom method on the filter
|            myMethod() {
|                // does something
|            }
|        }
|    });
|
|    ... // rest of component
|}
|
|// later in your app, if you want to execute myMethod()...
|laterOnInYourApplicationSomewhere() {
|    // get reference to the AG Grid Filter component on name column
|    api.getFilterInstance('name', filterInstance => {
|        filterInstance.myMethod();
|    });
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| The example below illustrates how a custom filter component can be accessed and methods on it invoked:
</framework-specific-section>

<framework-specific-section frameworks="react">
<grid-example title='React Filter Component' name='filter-component' type='mixed' options='{ "enterprise": false, "exampleHeight": 445 }'></grid-example>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| ## Accessing the VueJS Component Instance
|
| AG Grid allows you to get a reference to the filter instances via the `api.getFilterInstance(colKey)` method.
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="ts">
| // let's assume a VueJS component as follows
| export default {
|     template: `&lt;input style="height: 20px" :ref="'input'" v-model="text">`,
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
|         const filterInstance = api.getFilterInstance('name'); // assume filter on name column
|         filterInstance.myMethod();
|     }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| The example below illustrates how a custom filter component can be accessed and methods on it invoked:
</framework-specific-section>

<framework-specific-section frameworks="vue">
<grid-example title='Vue Filter Component' name='filter-component' type='mixed' options='{ "enterprise": false, "exampleHeight": 445, "onlyShow": "vue" }'></grid-example>
</framework-specific-section>
