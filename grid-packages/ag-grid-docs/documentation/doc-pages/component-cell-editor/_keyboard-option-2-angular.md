<framework-specific-section frameworks="angular">
<snippet transform={false}>
|const KEY_UP = 'ArrowUp';
|const KEY_DOWN = 'ArrowDown';
|
|@Component({
|    selector: 'my-grid',
|    template: `
|        &lt;ag-grid-angular
|                class="ag-theme-quartz"
|                [columnDefs]="columnDefs"
|                ...rest of the component...>
|        &lt;/ag-grid-angular>
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
|                    const key = params.event.key;
|                    const gridShouldDoNothing = params.editing && (key === KEY_UP || key === KEY_DOWN);
|                    return gridShouldDoNothing;
|                }
|          }
|    ]
|   
|    ...rest of the component...
|}
</snippet>
</framework-specific-section>