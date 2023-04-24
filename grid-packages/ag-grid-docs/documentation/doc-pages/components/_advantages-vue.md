[[only-vue]]
|### Advantages of By Name
|
|Registering components by name has the following advantages:
|
|- Implementations can change without having to change all the column definitions. For example, you may have 20 columns using a currency cell renderer. If you want to update the cell renderer to another currency cell renderer, you only need to do it in only place (where the cell renderer is registered) and all columns will pick up the new implementation.
|- The part of the grid specifying column definitions is plain JSON. This is helpful for applications that read column definitions from static data. If you referred to the class name directly inside the column definition, it would not be possible to convert the column definition to JSON.
|- No need to wrap components with `Vue.extend(...)` / `defineComponent(...)`
