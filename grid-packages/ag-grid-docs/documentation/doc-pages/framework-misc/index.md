---
title: "Vue Grid | ag-Grid"
frameworks: ["vue"]
---

## Overview

ag-Grid is designed to integrate deeply into Vue.<br>
Use our grid as a Vue component to quickly add a Vue grid table to your application.<br>
Discover key benefits and resources available to quickly add a data grid or Vue datatable to your Vue application.

This page details how to set up ag-Grid inside a Vue application.

## ag-Grid VueJS Features

[Every feature](../grid-features/) of ag-Grid is available when using the ag-Grid Vue table Component. The Vue Table Grid Component wraps the functionality of ag-Grid, it doesn't duplicate, so there will be no difference between core ag-Grid and Vue ag-Grid when it comes to features.

## Configuring ag-Grid in Vue

You can configure the grid in the following ways through VueJS:

- **Events:** All data out of the grid comes through events. These use VueJS event bindings eg `@model-updated="onModelUpdated"`. As you interact with the grid, the different events are fixed and output text to the console (open the dev tools to see the console). Note: Event binding must use the kebab style naming (i.e. `@model-updated`.
- **Properties:** All the data is provided to the grid as VueJS bindings. These are bound onto the ag-Grid properties bypassing the elements attributes. The values for the bindings come from the parent controller. eg `:rowData="rowData"`

- **Attributes:** When the property is just a simple string value, then no binding is necessary, just the value is placed as an attribute eg `rowHeight="22"`. If the attribute is a boolean and a value is not provided, it is taken as true.

- **Changing Properties:** When a property changes value, VueJS automatically passes the new value onto the grid.

Notice that the Vuejs table grid has its properties marked as **immutable**. Hence for object properties, the object reference must change for the grid to take impact. For example, `rowData` must be a new list of data for the grid to be informed to redraw.

### Defining VueJS Components for use in ag-Grid

VueJS components can be defined as either simple inline components, or as full/complex externalised ones (i.e in a separate file).

### Simple, Inline Components

```js
components: {
    'CubeComponent': {
        template: '<span>{{ valueCubed() }}</span>',
        methods: {
            valueCubed() {
                return this.params.value * this.params.value * this.params.value;
            }
        }
    },
    ParamsComponent: {
        template: '<span>Field: {{params.colDef.field}}, Value: {{params.value}}</span>',
        methods: {
            valueCubed() {
                return this.params.value * this.params.value * this.params.value;
            }
        }
    }
}
```

Note here that we can define the property name either quoted or not but note that in order 
to reference these components in your column definitions you'll need to provide them 
as **case-sensitive** strings.


### Simple, Locally Declared Components

```js
let SquareComponent = {
    template: '<span>{{ valueSquared() }}</span>',
    methods: {
        valueSquared() {
            return this.params.value * this.params.value;
        }
    }
};
```

### External .js Components

```js
// SquareComponent.js
export default {
    template: '<span>{{ valueSquared() }}</span>',
    methods: {
        valueSquared() {
            return this.params.value * this.params.value;
        }
    }
};

// MyGridApp.vue (your Component holding the ag-Grid component)
import SquareComponent from './SquareComponent'
```

### More Complex, Externalised Single File Components (.vue)

```js
<template>
    <span class="currency"><span ng-non-bindable>{{</span> params.value | currency('EUR') }}</span>
</template>

<script>
    export default {
        filters: {
            currency(value, symbol) {
                let result = value;
                if (!isNaN(value)) {
                    result = value.toFixed(2);
                }
                return symbol ? symbol + result : result;
            }
        }
    };
</script>

<style scoped>
    .currency {
        color: blue;
    }
</style>
```

For non-inline components you need to provide them to Vue via the `components` property:

```js
components: {
    AgGridVue,
    SquareComponent
}
```

Note that in this case the component name will match the actual reference, but you can specify 
a different one if you choose:

```js
components: {
    AgGridVue,
    'MySquareComponent': SquareComponent
}
```

In either case the name you use will be used to reference the component within the grid (see below).

### Referencing VueJS Components for use in ag-Grid

Having defined your component, you can now reference them in your column definitions.

To use a component within the grid you will reference components by **case-sensitive ** name, for example:

```js
// defined as a quoted string above: 'CubeComponent'
{
    headerName: "Cube",
    field: "value",
    cellRendererFramework: 'CubeComponent',
    colId: "cube",
    width: 125
},
// defined as a value above: ParamsComponent
{
    headerName: "Row Params",
    field: "row",
    cellRendererFramework: 'ParamsComponent',
    colId: "params",
    width: 245
},
```

Please see the relevant sections on [cell renderers](../component-cell-renderer/), 
[cell editors](../component-cell-editor/) and 
[filters](../filtering/) for configuring and using VueJS Components in ag-Grid.

The rich-grid example has ag-Grid configured through the template in the following ways:

```jsx
<ag-grid-vue
    style="width: 100%; height: 350px;"
    class="ag-theme-alpine"
    // these are attributes, not bound, give explicit values here
    rowHeight="22"
    rowSelection="multiple"

    // these are boolean values
    // (leaving them out will default them to false)
    animateRows             // same as :animateRows="true"
    :pagination="true"

    // these are bound properties
    :gridOptions="gridOptions"
    :columnDefs="columnDefs"

    // this is a callback
    :isScrollLag="myIsScrollLagFunction"

    // these are registering events
    @model-updated="onModelUpdated"
    @cell-clicked="onCellClicked"
</ag-grid-vue>
```

The above is all you need to get started using ag-Grid in a VueJS application. Now would 
be a good time to try it in a simple app and get some data displaying and practice with 
some of the grid settings before moving onto the advanced features of cellRendering 
and custom filtering.

## Using Markup to Define Grid Definitions

You can also define your grid column definition decoratively if you would prefer.

You declare the grid as normal:

```jsx
<ag-grid-vue
    class="ag-theme-alpine"
    style="width: 700px; height: 400px;"
    :rowData="rowData"
    //...rest of definition
```

And within this component you can then define your column definitions:

```jsx
<ag-grid-vue
    .....rest of definition
>
    <ag-grid-column headerName="IT Skills">
        <ag-grid-column 
            field="skills" 
            :width="120" 
            suppressSorting
            cellRendererFramework="SkillsCellRenderer"
            :menuTabs="['filterMenuTab']">
        </ag-grid-column>
        <ag-grid-column 
            field="proficiency" 
            :width="135"
            cellRendererFramework="ProficiencyCellRenderer"
            :menuTabs="['filterMenuTab']"">
        </ag-grid-column>
    </ag-grid-column>
</ag-grid-vue>
```

In this example we're defining a grouped column with `IT Skills` having two child columns 
`Skills and Proficiency`.

Not that anything other than a string value will need to be bound (i.e. `:width="120"`) as Vue will 
default to providing values as Strings.

A full working example of defining a grid declaratively can be found in the [Vue Playground Repo.](https://github.com/seanlandsman/ag-grid-vue-playground)


## Binding Row Data with **v-model**

You can bind row data in the usual way with `:rowData="rowData"`, but you can also do so by using `v-model`.

The advantage of doing so is that this will facilitate unidirectional data flow (see next section). 
The main difference over normal binding is that any data changes will emit an `data-model-changed` 
event which will have the current row data as a parameter.

Please refer to the section below for a practical application of this binding.

## Memory Footprint, Vuex and Unidirectional Data Flow

Please refer to [Memory Footprint, Vuex & Unidirectional Data Flow](../framework-data-flow/)

## Child to Parent Communication

There are a variety of ways to manage component communication in Vue (shared service, local variables etc), 
but you often need a simple way to let a "parent" component know that something has happened on a "child" 
component. In this case the simplest route is to use the `gridOptions.context` to hold a reference to the 
parent, which the child can then access.

```js
// in the parent component - the component that hosts ag-grid-vue and specifies which vue components to use in the grid
beforeMount() {
    this.gridOptions = {
        context: {
            componentParent: this
        }
    };
    this.createRowData();
    this.createColumnDefs();
},

// in the child component - the Vue components created dynamically in the grid
// the parent component can then be accessed as follows:
this.params.context.componentParent
```

Note that although we've used `componentParent` as the property name here it can be anything - the main
point is that you can use the `context` mechanism to share information between the components.


### Building & Bundling

There are many ways to build and/or bundle an VueJS Application. We provide fully working examples using the [Vue CLI](https://cli.vuejs.org/) as part of the [ag-grid-vue-example](https://github.com/ag-grid/ag-grid-vue-example) on GitHub.

For UMD bundling please refer to the [UMD](https://github.com/seanlandsman/ag-grid-vue-umd) repo for a working
example of how this can be done.

## Cell Rendering & Cell Editing using VueJS

It is possible to build [cell renderers](../component-cell-renderer/), 
[cell editors](../cell-editing/) and 
[filters](../filtering/) using VueJS. Doing each of these is explained in the section on each.

## “$attrs is readonly”,“$listeners is readonly”,“Avoid mutating a prop directly”

Despite the wording of this warning, the issue is almost always due to multiple versions of `Vue` being
instantiated at runtime.

This can occur in any number of ways, but the solution is simple - update (or create) `webpack.config.js`:


```js
resolve: {
    alias: {
        'vue$': path.resolve(__dirname, 'node_modules/vue/dist/vue.js')
    }
}
```

Here we're telling Webpack to use the full build. You may need to change the value according 
to the build you need.

Please refer to the [Vue Documentation](https://vuejs.org/v2/guide/installation.html#Explanation-of-Different-Builds) 
for more information on the different builds available.

The longer term fix is something the Vue team are contemplating - please refer to this
[GitHub Issue](https://github.com/vuejs/vue/issues/8278) for more information.

## Example Repos

The following Vue repos are available, with each demonstrating a different feature:

- [Main Example](https://github.com/ag-grid/ag-grid-vue-example)
- [Vuex](https://github.com/seanlandsman/ag-grid-vue-vuex)
- [i18n](https://github.com/seanlandsman/ag-grid-vue-i18n)
- [Routing](https://github.com/seanlandsman/ag-grid-vue-routing)
- [Typescript](https://github.com/seanlandsman/ag-grid-vue-typescript)
- [UMD](https://github.com/seanlandsman/ag-grid-vue-umd)
- [Playground](https://github.com/seanlandsman/ag-grid-vue-playground): Declarative, Auto Refresh and Model Driven Examples

