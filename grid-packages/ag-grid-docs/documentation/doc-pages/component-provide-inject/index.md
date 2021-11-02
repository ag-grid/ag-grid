---
title: "Provide/Inject With AG Grid Vue Components"
frameworks: ["vue"]
---

When using Vue Components within AG Grid you are able to use `provide` / `context`, but only in the `Options` format below:

```js
// Parent Grid
const VueExample = {
    template: `
        <ag-grid-vue
                style="width: 100%; height: 100%;"
                class="ag-theme-alpine"
                :columnDefs="columnDefs"
                :rowData="rowData">
        </ag-grid-vue>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        'myRenderer': MyRenderer
    },
    provide: {
        'providedValue': 'testValue' // provide this value to grid components
    },
 
    //...rest of the component definition
}

// Child Grid Component
export default {
    name: 'myRenderer',
    template: `<span>{{ value }} {{ test }}</span>`,
    inject: ['providedValue'],   // retrieve/inject the provided value
    
    //...rest of the component definition
};
```

You cannot use the new Composition API (inject/provide) as this is not supported by Vue when using `createVNode`, but the above is a workable alternative.

Alternatively you could consider using the Grid's [Context](/context/) mechanism to share data with child components.
