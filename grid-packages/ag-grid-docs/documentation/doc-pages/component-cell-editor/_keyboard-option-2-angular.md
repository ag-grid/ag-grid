[[only-angular]]
|
|```js
|const KEY_UP = 38;
|const KEY_DOWN = 40;
|
|@Component({
|    selector: 'my-grid',
|    template: `
|        <ag-grid-angular
|                class="ag-theme-alpine"
|                [columnDefs]="columnDefs"
|                ...rest of the component...>
|        </ag-grid-angular>
|    `
|})
|export class AppComponent {
|    private columnDefs = [
|          {
|                headerName: "Value Column",
|                field: "value",
|                suppressKeyboardEvent: params => {
|                    console.log('cell is editing: ' + params.editing);
|                    console.log('keyboard event:', params.event);
|                
|                    // return true (to suppress) if editing and user hit up/down keys
|                    const keyCode = params.event.keyCode;
|                    const gridShouldDoNothing = params.editing && (keyCode===KEY_UP || keyCode===KEY_DOWN);
|                    return gridShouldDoNothing;
|                }
|          }
|    ]
|   
|    ...rest of the component...
|}
|```
