[[only-javascript]]
|## Registering Custom Components
|
|There are two ways to tell the Grid to use a custom component:
|
|- Direct reference.
|- By name.
|
|### 1. Direct Reference
|
|The easiest approach is to refer to the Component class directly.
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
|
|The advantage of referencing Components directly is cleaner code, without the extra level of indirection added when referencing by name.
|
|### 2. By Name
|
|A Component is registered with the grid by providing it through the `components` grid property. The `components` grid property contains a map of Component Names to Component Classes. Components of all types (editors, renderers, filters etc) are all stored together and must have unique names.
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
|The advantage of referencing components by name is definitions (eg Column Definitions) can be composed of simple types (ie JSON), which is useful should you wish to persist Column Definitions.