[[only-javascript]]
|## Registering Custom Components
|
|The pages for each component type (cell renderer, cell editor etc) contain examples on how to register and use each component type. However it is useful here to step back and focus on the component registration process which is common across all component types and all frameworks (React, Angular etc).
|
|There are two ways to register custom components:
|
|- By name.
|- Direct reference.
|
|Both options are fully supported by the grid, however the preferred option is by name as it's more flexible. All of the examples in the documentation use this approach. The direct reference approach is kept for backwards compatibility as this was the original way to do it in AG Grid.
|
|### 1. By Name
|
|A component is registered with the grid by providing it through the `components` grid property. The `components` grid property contains a map of 'component names' to 'component classes'. Components of all types (editors, renderers, filters etc) are all stored together and must have unique names.
|
|```js
|gridOptions = {
|
|    // register the components using 'components' grid property
|    components: {
|        // 'countryCellRenderer' is mapped to class CountryCellRenderer
|        countryCellRenderer: CountryCellRenderer,
|        // 'countryFilter' is mapped to class CountryFilter
|        countryFilter: CountryFilter
|    },
|
|    // then refer to the component by name
|    columnDefs: [
|        {
|            field: 'country',
|            cellRenderer: 'countryCellRenderer',
|            filter: 'countryFilter'
|        },
|    ],
|
|    ...
|}
|```
|
|### 2. Direct Reference
|
|A shorter approach is to refer to the component class directly.
|
|```js
|gridOptions = {
|
|    columnDefs: [
|        {
|            field: 'country',
|            cellRenderer: CountryCellRenderer,
|            filter: CountryFilter
|        },
|    ],
|
|    ...
|}
|```
