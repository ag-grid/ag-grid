---
title: "Testing AG Grid"
---

Here we give some hints on testing AG Grid as part of your application.

<framework-specific-section frameworks="javascript">
| ## Testing with Jest 
| 
| If you're using [Modules](/packages-modules) then you will have to make the following configuration changes to accommodate ES Modules - if you're using Packages then this configuration is not required.
|
| In order to test AG Grid with Jest you'll need to make the following configuration changes:
|
| In `jest.config.js` add the following lines:
|
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
|module.exports = {
|  "transform": {
|    "^.+\\.(ts|tsx|js|jsx|mjs)$": [
|      "babel-jest"  // or "ts-test" or whichever transformer you're using
|    ]
|  },
|  transformIgnorePatterns: ['/node_modules/(?!(@ag-grid-community|@ag-grid-enterprise)/)']
}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
| ## Testing with DOM Testing Library
|
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<p>In the following example we test a simple configuration of AG Grid with the <a href="https://testing-library.com/docs/dom-testing-library/intro/" target="_blank">DOM Testing Library</a>. </p>
</framework-specific-section>


<framework-specific-section frameworks="javascript">
<snippet transform="{false}">
|import { getByText } from '@testing-library/dom';
|import '@testing-library/jest-dom';
|
|import { createGrid, GridOptions } from 'ag-grid-community';
|
|function createAgGrid() {
|    const div = document.createElement('div');
|
|    const gridOptions: GridOptions = {
|        columnDefs: [
|            { headerName: 'Make', field: 'make' },
|            { headerName: 'Model', field: 'model' },
|            { field: 'price', valueFormatter: (params) => '$' + params.value.toLocaleString() },
|        ],
|        rowData: [
|            { make: 'Toyota', model: 'Celica', price: 35000 },
|            { make: 'Ford', model: 'Mondeo', price: 32000 },
|            { make: 'Porsche', model: 'Boxster', price: 72000 },
|        ],
|    };
|
|    const api = createGrid(div, gridOptions);
|
|    return { div, api };
|}
|
|test('examples of some things', async () => {
|    const { div, api } = createAgGrid();
|
|    // Get a cell value
|    expect(getByText(div, 'Ford')).toHaveTextContent('Ford');
|
|    // Test the value formatter by searching for the correct price string
|    expect(getByText(div, '$72,000')).toBeDefined();
|
|    // Test via the api even though this is not a recommended approach
|    expect(api.getDisplayedRowCount()).toBe(3);
|});
</snippet> 
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<p>The test above can be found in the following <a href="https://github.com/ag-grid/ag-grid-dev">GitHub Repo</a>.</p>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| ### Using Jest with Angular (for example with an Nx/Angular project)
|
| In order to test AG Grid with Jest you'll need to make the following configuration changes:
|
| In `jest.config.js` add the following line:
|
| `resolver: '&lt;rootDir>myResolver.js',`
|
| Then create a file called `myResolver.js` in the root directory of your project:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
|module.exports = (request, options) => {
|    return options.defaultResolver(request, {
|        ...options,
|        packageFilter: pkg => {
|            const packageName = pkg.name;
|            if (packageName === '@ag-grid-community/angular') {
|                return {
|                    ...pkg,
|                };
|            }
|            const agDependency = packageName.startsWith("@ag-grid");
|            return {
|                ...pkg,
|                // default to use the CommonJS ES5 entry point for Jest testing with AG Grid
|                main: agDependency ? './dist/cjs/es5/main.js' : pkg.module || pkg.main,
|            };
|        },
|    });
|};
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<p>We will walk through how you can use testing AG Grid as part of your Angular application, using default build tools provided when using the <a href="https://cli.angular.io/">Angular CLI</a>.</p>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| ## Configuring the Test Module
|
| Before we can test our component we need to configure the `TestBed`. In this example we have a `TestHostComponent` that wraps `AgGridAngular` so we pass that to the `TestBed`.
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
| @Component({
|     selector: 'app-grid-wrapper',
|     standalone: true,
|     imports: [AgGridAngular],
|     template: `&lt;ag-grid-angular
|         [rowData]="rowData"
|         [columnDefs]="columnDefs">&lt;/ag-grid-angular>`,
| })
| export class TestHostComponent {
| 
|     rowData: any[] = [{ name: 'Test Name', number: 42 }];
|     columnDefs: ColDef[] = [
|         { field: 'name' },
|         { field: 'number', colId: 'raw', headerName: 'Raw Number', editable: true, cellEditor: EditorComponent },
|         { field: 'number', colId: 'renderer', headerName: 'Renderer Value', cellRenderer: PoundRenderer },
|     ];
| 
|     @ViewChild(AgGridAngular) public agGrid: AgGridAngular;
| }
| 
| 
| beforeEach(async () => {
|   await TestBed.configureTestingModule({
|       imports: [TestHostComponent],
|    }).compileComponents();
|
|    fixture = TestBed.createComponent(TestHostComponent);
|    component = fixture.componentInstance;
| });
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| ## Testing via the Grid API
|
| The grid api will be available after `detectChanges()` has run and the fixture is stable. This is true if you store a reference to the `api` within `onGridReady` or use a `ViewChild` to access the `AgGridAngular` component.
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
| it('ViewChild not available until `detectChanges`', () => {
|    expect(component.agGrid).not.toBeTruthy();
| });
|
| it('ViewChild is available after `detectChanges`', async () => {
|    // Detect changes triggers the AgGridAngular lifecycle hooks
|    fixture.detectChanges();
|    // Wait for the fixture to stabilise
|    await fixture.whenStable();
|    // ViewChild now has a reference to the component
|    expect(component.agGrid.api).toBeTruthy();
| });
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| ## Testing Grid Contents
|
| One way to check the grid contents is to access the `nativeElement` and query DOM elements from there:
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
| it('the grid cells should be as expected', async () => {
|
|     fixture.detectChanges();
|     await fixture.whenStable();
|
|     const cellElements =  fixture.nativeElement.querySelectorAll('.ag-cell-value');
|
|     expect(cellElements.length).toEqual(3);
|     expect(cellElements[0].textContent).toEqual("Test Name");
|     expect(cellElements[1].textContent).toEqual("42");
|     expect(cellElements[2].textContent).toEqual("£42");
| });
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| ## Testing User Supplied Components
|
| To test user supplied components you can access them via the grid API.
|
| For example, given the following code:
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
| 
|   @Component({
|     standalone: true,
|     template: `£{{params?.value}}`,
|   })
|   export class PoundRenderer implements ICellRendererAngularComp {
|     params: ICellRendererParams | undefined;
|   
|     agInit(params: ICellRendererParams): void {
|         this.params = params;
|     }
|   
|     refresh(params: ICellRendererParams) {
|         this.params = params;
|         return true;
|     }
|   }
| 
| @Component({
|     selector: 'editor-cell',
|     template: `&lt;input #input [(ngModel)]="value" style="width: 100%">`
|     }
| )
| export class EditorComponent implements ICellEditorAngularComp {
|     private params: ICellEditorParams;
|     public value: number;
|
|     @ViewChild('input', {read: ViewContainerRef}) public input;
|
|     agInit(params: ICellEditorParams): void {
|         this.params = params;
|         this.value = this.params.value;
|     }
|
|     getValue(): any {
|         return this.value;
|     }
|
|     // for testing
|     setValue(newValue: any) {
|         this.value = newValue;
|     }
|
|     isCancelBeforeStart(): boolean {
|         return false;
|     }
|
|     isCancelAfterEnd(): boolean {
|         return false;
|     };
| }
|
| @Component({
|     template:
|         `&lt;div>
|             &lt;ag-grid-angular
|                 style="width: 100%; height: 350px;" class="ag-theme-quartz"
|                 [columnDefs]="columnDefs"
|                 [rowData]="rowData"
|                 [stopEditingWhenCellsLoseFocus]="false"
|                 (gridReady)="onGridReady($event)">
|             &lt;/ag-grid-angular>
|         &lt;/div>`
| })
| class TestHostComponent {
|     rowData: any[] = [{name: 'Test Name', number: 42}];
|
|     columnDefs: ColDef[] = [
|         {field: "name"},
|         {field: "number", colId: "raw", headerName: "Raw Number", editable: true, cellEditor: EditorComponent},
|         {field: "number", colId: "renderer", headerName: "Renderer Value", cellRenderer: PoundRenderer}
|     ];
|
|     api: GridApi;
|
|     public onGridReady(params: GridReadyEvent) {
|         this.api = params.api;
|     }
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| We can test that the `EditorComponent` works as follows:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} >
| it('cell should be editable and editor component usable', async () => {
|     // Setup template bindings and run ngOInit. This causes the &lt;ag-grid-angular> component to be created.
|     // As part of the creation the grid apis will be attached to the gridOptions property.
|       fixture.autoDetectChanges();
|       await fixture.whenStable();
|
|     // we use the API to start and stop editing - in a real e2e test we could actually double click on the cell etc
|     component.api.startEditingCell({
|             rowIndex: 0,
|             colKey: 'raw'
|         });
|
|     const instances = component.api.getCellEditorInstances();
|     expect(instances.length).toEqual(1);
|
|     const editorComponent = instances[0];
|     editorComponent.setValue(100);
|
|     component.api.stopEditing();
|
|     await fixture.whenStable();
|
|     const cellElements = fixture.nativeElement.querySelectorAll('.ag-cell-value');
|     expect(cellElements.length).toEqual(3);
|     expect(cellElements[0].textContent).toEqual("Test Name");
|     expect(cellElements[1].textContent).toEqual("100");
|     expect(cellElements[2].textContent).toEqual("£100");
| });
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| ## Testing with Angular Testing Library
</framework-specific-section>

<framework-specific-section frameworks="angular">
<p>It is also possible to use <a href="https://testing-library.com/docs/angular-testing-library/intro/" target="_blank">Angular Testing Library</a> to test AG Grid. Here is one example showing how to test a row click handler that displays the last clicked row above the grid. </p>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} >
|&lt;div data-testid="rowClicked">Row Clicked: {{ rowClicked?.make }}&lt;/div>
|&lt;ag-grid-angular [columnDefs]="columnDefs" [rowData]="rowData" (onRowClicked)="onRowClicked($event)"> &lt;/ag-grid-angular>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} >
|import { render, screen } from '@testing-library/angular';
|import userEvent from '@testing-library/user-event';
|
|it('Test cell clicked run row handler', async () => {
|   render(GridWrapperComponent);
|
|   const row = await screen.findByText('Ford');
|
|   await userEvent.click(row);
|
|   const rowClicked = await screen.findByTestId('rowClicked');
|   expect(rowClicked.textContent).toBe('Row Clicked: Ford');
|});
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| ## Applying Styles To The Grid When Testing
|
| Although not strictly necessary when unit testing the grid, it is still useful to see the grid
| rendered when debugging. In order for this to work you need to provide the CSS to `karma.conf.js`:
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
| // not strictly required for testing but useful when debugging the grid in action
| files: [
|     '../node_modules/ag-grid-community/styles/ag-grid.css',
|     '../node_modules/ag-grid-community/styles/ag-theme-quartz.css'
| ]
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<p>All the tests above and more can be found in the following <a href="https://github.com/ag-grid/ag-grid-angular-cli-example/tree/latest/src/tests">GitHub Repo</a>.</p>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|## Next Up
|
|Continue to the next section to learn about [Testing Async](/testing-async/).
</framework-specific-section>

<framework-specific-section frameworks="react">
| ## Testing with Jest 
| 
| If you're using [Modules](/packages-modules) then you will have to make the following configuration changes to accommodate ES Modules - if you're using Packages then this configuration is not required.
|
| In order to test AG Grid with Jest you'll need to make the following configuration changes:
|
| In `jest.config.js` add the following lines:
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false}>
|module.exports = {
|  "transform": {
|    "^.+\\.(ts|tsx|js|jsx|mjs)$": [
|      "babel-jest"  // or "ts-test" or whichever transformer you're using
|    ]
|  },
|  transformIgnorePatterns: ['/node_modules/(?!(@ag-grid-community|@ag-grid-enterprise)/)']
}
</snippet>
</framework-specific-section>


<framework-specific-section frameworks="react">
|
| ## Testing with React Testing Library
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<p>In the following examples we will be using <a href="https://testing-library.com/docs/react-testing-library/intro/" target="_blank">React Testing Library</a> to test AG Grid. Each example will share a common App starting point that is defined below. </p>
</framework-specific-section>


<framework-specific-section frameworks="react">
<snippet transform={false}>
| 
| const App = () => {
|     const [rowData] = useState([
|         { make: 'Toyota', model: 'Celica', price: 35000 },
|         { make: 'Ford', model: 'Mondeo', price: 32000 },
|         { make: 'Porsche', model: 'Boxster', price: 72000 }
|     ]);
|     const [colDefs, setColDefs] = useState&lt;ColDef[]>([
|         { field: 'make' },
|         { field: 'model' },
|         { field: 'price' },
|     ]);
| 
|     return (
|         &lt;div className="ag-theme-quartz" style={{ height: 400, width: 600 }}>
|             &lt;AgGridReact
|                 rowData={rowData}
|                 columnDefs={colDefs} />
|         &lt;/div>
|     );
| };
</snippet>
</framework-specific-section>


<framework-specific-section frameworks="react">
| ### Testing Cell Contents
|
| The following example shows how to validate the grid is displaying the expected values including those cells using a custom cell renderer.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false}>
| // Custom Cell Renderer
| const BuyCellRenderer = (props: CustomCellRendererProps) => {
|     const buttonClick = () => props.node.setDataValue('bought', true);
| 
|     return (
|         &lt;>
|             {props.data?.bought ?
|                 &lt;span>Bought a {props.data?.make}&lt;/span> :
|                 &lt;button onClick={buttonClick}>Buy: {props.data?.make}&lt;/button>
|             }
|         &lt;/>
|     );
| };
| 
| // Column Definitions with value formatter and cellRenderer
| const [colDefs, setColDefs] = useState&lt;ColDef[]>([
|     { field: 'make' },
|     { field: 'model' },
|     { field: 'price', valueFormatter: (params) => "$" + params.value.toLocaleString()},
|     { field: 'bought', cellRenderer: BuyCellRenderer }
| ]);
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| The code to test the valueFormatter and cellRenderer is as follows.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false}>
| test('value formatter and cell renderer', async () => {
|     // First render the App component we wish to tests
|     render(&lt;App />);
| 
|     // Test the value formatter by searching for the correct price string
|     expect(screen.getByText('$72,000')).toBeDefined();
| 
|     // Now find the expected content of the cell renderer
|     const porscheButton = await screen.findByText('Buy: Porsche');
|     expect(porscheButton).toBeDefined();
| 
|     // Click the cell renderer to test it changes correctly
|     act(() => porscheButton.click());
|     expect(screen.findByText('Bought a Porsche')).toBeDefined();
| });
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| ### Clicking Rows
|
| To test clicking rows it is recommend to use `userEvent` from `testing-library/user-event` to trigger row click event handlers. The following test displays the last clicked row above the grid.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false}>
|&lt;div data-testid="rowClicked">Row Clicked: {rowClicked?.make}&lt;/div>
|&lt;div className="ag-theme-quartz" style={{ height: 400, width: 600 }}>
|   &lt;AgGridReact
|       rowData={rowData}
|       columnDefs={colDefs}
|       onRowClicked={onRowClicked} />
|&lt;/div>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false}>
|test('render grid and click a row', async () => {
|   render(&lt;App />);
|
|   const row = await screen.findByText('Ford');
|   expect(row).toBeDefined();
|
|   await userEvent.click(row);
|
|   const rowClicked = await screen.findByTestId('rowClicked');
|   expect(rowClicked.textContent).toBe('Row Clicked: Ford');
|});
</snippet>
</framework-specific-section>


<framework-specific-section frameworks="react">
| ### Cell Editing
|
| The following example shows how to mimic a user editing a cell's value.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false}>
|test('double click cell to edit', async () => {
|   render(&lt;App />);
|
|   const porschePrice = await screen.findByText('$72,000')
|   expect(porschePrice).toBeDefined();
|
|   // double click to enter edit mode       
|   await userEvent.dblClick(porschePrice);
|
|   // Find the input within the cell.
|   const input: HTMLInputElement = within(porschePrice).getByLabelText('Input Editor');
|   // Type the new price value
|   await userEvent.keyboard('100000');
|
|   // Press enter to save
|   fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
|
|   expect(screen.findByText('$100,000')).toBeDefined();
|
|});
</snippet>
</framework-specific-section>


<framework-specific-section frameworks="react">
<p>All the tests above and more can be found in the following <a href="https://github.com/ag-grid/ag-grid-react-example/tree/latest/src/tests">GitHub Repo</a>.</p>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<p>We will walk through how you can use testing AG Grid as part of your Vue application, using default build tools provided when using the <a href="https://cli.vuejs.org/">Vue CLI</a> utility.</p>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| ## Waiting for the Grid to be Initialised
|
| Due to the asynchronous nature of AG Grid we cannot simply mount the Grid and assume it'll be ready
| for testing in the next step - we need to wait for the Grid to be ready before testing it.
|
| We can do this in one of two ways - wait for the `gridReady` event to be fired, or wait for the Grid API to be set.
|
| The first requires a code change and can be tricky to hook into - the latter is unobtrusive and easier to use.
|
| We can create a utility function that will wait for the Grid API to be set for a set amount of time/attempts:
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
| const ensureGridApiHasBeenSet = vm => new Promise(function (resolve, reject) {
|     (function waitForGridReady() {
|         // we need to wait for the gridReady event before we can start interacting with the grid
|         // in this case we're looking at the api property in our App component,
|         // but it could be anything (ie a boolean flag)
|         if (vm.$data.api) {
|             // once our condition has been met we can start the tests
|             return resolve();
|         }
|
|         // not set - wait a bit longer
|         setTimeout(waitForGridReady, 10);
|     })();
| });
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| We can now use this utility method before each test or in the `beforeEach` to ensure the Grid is fully ready
| before continuing with out test:
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
| beforeEach((done) => {
|     wrapper = mount(GridExample, {});
|
|         // don't start our tests until the grid is ready
|         // it doesn't take long for the grid to initialise, but it is some finite amount of time
|         // after the component is ready
|         ensureGridApiHasBeenSet(wrapper.vm).then(() => done());
| });
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| ### Vue Testing Library
</framework-specific-section>

<framework-specific-section frameworks="vue">
<p>An alternative approach would be to use the <a href="https://testing-library.com/docs/vue-testing-library/intro" target="_blank">Vue Testing Library</a> to test AG Grid. This comes with built in support for handling asynchronous behaviour which you may find easier to work with.</p>
</framework-specific-section>


<framework-specific-section frameworks="vue">
|
| ## Testing User Supplied Components
|
| For example, let us suppose a user provides a custom [Editor Component](/component-cell-editor/) and wants
| to test this within the context of the Grid.
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
| // Editor Component - Editor.vue
| &lt;template>
|     &lt;input v-model="value" type="number" style="width: 100%">
| &lt;/template>
|
| &lt;script>
|     export default {
|         name: 'Editor',
|         data() {
|             return {
|                 value: null
|             }
|         },
|         beforeMount() {
|             this.value = this.params.value;
|         },
|         methods: {
|             getValue() {
|                 return this.value;
|             },
|
|             // for testing
|             setValue(newValue) {
|                 this.value = newValue;
|             },
|
|             isCancelBeforeStart() {
|                 return false;
|             },
|
|             isCancelAfterEnd() {
|                 return false;
|             }
|         }
|     }
| &lt;/script>
|
| &lt;template>
|     &lt;ag-grid-vue style="width: 500px; height: 500px;"
|                  class="ag-theme-balham"
|                  @grid-ready="onGridReady"
|                  :columnDefs="columnDefs"
|                  :rowData="rowData">
|     &lt;/ag-grid-vue>
| &lt;/template>
|
| &lt;script>
|     import {AgGridVue} from "ag-grid-vue3";
|     import Editor from './Editor.vue';
|
|     export default {
|         name: 'App',
|         data() {
|             return {
|                 columnDefs: null,
|                 rowData: null,
|                 api: null
|             }
|         },
|         components: {
|             AgGridVue,
|             Editor
|         },
|         beforeMount() {
|             this.columnDefs = [
|                 {field: 'make'},
|                 {
|                     field: 'price',
|                     editable: true,
|                     cellEditor: 'Editor'
|                 }
|             ];
|
|             this.rowData = [
|                 {make: 'Toyota', price: '35000'},
|             ];
|         },
|         methods: {
|             onGridReady(params) {
|                 this.api = params.api;
|             }
|         }
|     }
| &lt;/script>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| We can test the interaction between the Grid and the Editor component via the Grid API:
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
| it('grid renders as expected', () => {
|     const cells = wrapper.findAll('.ag-cell-value');
|     expect(cells.length).toEqual(2);
|
|     expect(cells.at(0).text()).toEqual('Toyota');
|     expect(cells.at(1).text()).toEqual('70000');
| });
|
| it('cell should be editable and editor component usable', () => {
|     // wait for the api to be set before continuing
|     const componentInstance = wrapper.vm;
|
|     const api = componentInstance.$data.api;
|
|     // we use the API to start and stop editing - in a real e2e test we could actually
|     // double click on the cell etc
|     api.startEditingCell({
|         rowIndex: 0,
|         colKey: 'price'
|     });
|
|     // update the editor input
|     const textInput = wrapper.find('input[type="number"]');
|     textInput.setValue(100000);
|
|     // stop editing
|     api.stopEditing();
|
|     // test the resulting values in the grid (the edited cell value should have changed)
|     const cells = wrapper.findAll('.ag-cell-value');
|     expect(cells.length).toEqual(2);
|
|     expect(cells.at(0).text()).toEqual('Toyota');
|     expect(cells.at(1).text()).toEqual('200000');
| });
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| We use the Grid API to initiate and end testing as we're can't readily perform double clicks in a
| unit testing environment (but could if doing e2e with something like Protractor for example).
|
| ## Jest Configuration
|
| ### `SyntaxError: Cannot use import statement outside a module`
|
| If you experience the error above then depending on your build configuration you may need to exclude either
| `ag-grid-vue` or `@ag-grid-community/vue` (or `ag-grid-vue3` / `@ag-grid-community/vue3` if using Vue 3) in your Jest configuration:
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
| module.exports = {
|   ...other configuration...
|   transformIgnorePatterns: ["/node_modules/(?!ag-grid-vue)"],
|   ..or, if using modules:
|   transformIgnorePatterns: ["/node_modules/(?!@ag-grid-community/vue)"],
| }
</snippet>
</framework-specific-section>