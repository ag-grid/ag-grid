---
title: "Miscellaneous"
frameworks: ["vue"]
---

## Overview

This section describes some of the finer grain tuning you might want to do with your React & AG Grid application.

## Binding Row Data with **v-model**

You can bind row data in the usual way with `:rowData="rowData"`, but you can also do so by using `v-model`.

The advantage of doing so is that this will facilitate unidirectional data flow (see next section). 
The main difference over normal binding is that any data changes will emit an `data-model-changed` 
event which will have the current row data as a parameter.

Please refer to the section below for a practical application of this binding.

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

