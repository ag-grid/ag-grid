[[only-vue]]
|
|```js
|const KEY_UP = 38;
|const KEY_DOWN = 40;
|
|const MyGrid = {
|    template: `
|       <ag-grid-vue
|           class="ag-theme-alpine"
|           :columnDefs="columnDefs">
|       </ag-grid-vue>
|    `,
|    components: {
|        'ag-grid-vue': AgGridVue
|    },
|    data: function () {
|        return {
|            columnDefs: [
|               {
|                   headerName: "Value Column",
|                   field: "value",
|                   suppressKeyboardEvent: params => {
|                       console.log('cell is editing: ' + params.editing);
|                       console.log('keyboard event:', params.event);
|                
|                       // return true (to suppress) if editing and user hit up/down keys
|                       const keyCode = params.event.keyCode;
|                       const gridShouldDoNothing = params.editing && (keyCode===KEY_UP || keyCode===KEY_DOWN);
|                       return gridShouldDoNothing;
|                   }
|               }
|            ]
|        }
|    },
|
|    // rest of the component
|}
|```
