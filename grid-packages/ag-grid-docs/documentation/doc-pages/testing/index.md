---
title: "Testing AG Grid"
---

[[only-javascript]]
| We will walk through how you can use `Protractor` and `Jasmine` to do Unit & End to End (e2e)
| testing with AG Grid in this section.
|
| ## Unit Testing with Jasmine - Waiting for the API
|
| In order to unit test your application you need to ensure that the Grid API is available - the
| best way to do this is to set a flag when the Grid's `gridReady` event fires, but this requires an application code change.
|
| An alternative is to use a utility function that polls until the API has been set on the `GridOptions`:
|
| ```js
| function waitForGridApiToBeAvailable(gridOptions, success) {
|     // recursive without a terminating condition,
|     // but jasmines default test timeout will kill it (jasmine.DEFAULT_TIMEOUT_INTERVAL)
|     if(gridOptions.api) {
|         success()
|     } else {
|         setTimeout(function () {
|           waitForGridApiToBeAvailable(gridOptions, success);
|         }, 500);
|     }
| }
| ```
|
| Once the API is ready, we can then invoke Grid `API` and `ColumnApi` methods:
|
| ```js
| it('select all button selects all rows', () => {
|     selectAllRows();  // selectAllRows is a global function created in the application code
|     expect(gridOptionsUnderTest.api.getSelectedNodes().length).toEqual(3);
| });
| ```
|
| ## End to End (e2e) Testing
|
| These recipes below are suggestions - there are many ways to do End to End testing, what we document
| below is what we use here at AG Grid.
|
| We do not document how to use either `Protractor` and `Jasmine` in depth here - please see either the
| <a href="http://www.protractortest.org/#/" target="_blank">Protractor</a> or
| <a href="https://jasmine.github.io/" target="_blank">Jasmine</a> for information around either of these tools.
| We only describe how these tools can be used to test AG Grid below.
|
| [[note]]
| | End to End testing can be fragile. If you change something trivial upstream it can have a big impact
| | on an End to End test, so we recommend using End to End tests in conjuction with unit tests. It's often
| | easier to find and fix a problem at the unit testing stage than it is in the end to end stage.
|
| ## Testing Dependencies
|
| ```bash
| npm install protractor webdriver-manager --save-dev
|
| # optional dependencies - if you're using TypeScript
| npm install @types/jasmine @types/selenium-webdriver --save-dev
| ```
|
| Note you can install `protractor` and `webdriver-manager` globally if you'd prefer, which would allow
| for shorter commands when executing either of these tools.
|
| We now need to update the webdriver:
|
| ```bash
| ./node_modules/.bin/webdriver-manager update
| ```
|
| This can be added to your package.json for easier packaging and repeatability:
|
| ```json
| "scripts": {
|     "postinstall": "webdriver-manager update"
| }
| ```
|
| ### Selenium Server
|
| You can either start & stop your tests in a script, or start the Selenium server separately,
| running your tests against it.
|
| Remember that the interaction between your tests and the browser is as follows:
|
| ```bash
| [Test Scripts] < ------------ > [Selenium Server] < ------------ > [Browser Drivers]
| ```
|
| We'll run the server separately to begin with here:
|
| ```bash
| ./node_modules/.bin/webdriver-manager start
| ```
|
| ## Sample Configuration
|
| ```js
| // conf.js
| exports.config = {
|     framework: 'jasmine',
|     specs: ['spec.js']
| }
|
| // Here we specify the Jasmine testing framework as well as our test to run.
| ```
| ## Sample Test
|
| [[note]]
| | If you're testing against a non-Angular application then you need to tell `Protractor`
| | not to wait for Angular by adding this to either your configuration or your tests: `browser.ignoreSynchronization = true;`
|
| For this sample test we'll be testing this simple example:
|
| <grid-example title='Hello World' name='hello-world' type='typescript' options='{ "exampleHeight": "210px" }'></grid-example>
|
| ## Checking Headers
|
| Let's start off by checking the headers are the ones we're expecting. We can do this by retrieving
| all `div`'s that have the `ag-header-cell-text` class:
|
| ```js
| // spec.js
| describe('AG Grid Protractor Test', function () {
|     // not an angular application
|     browser.ignoreSynchronization = true;
|
|     beforeEach(() => {
|         browser.get('https://www.ag-grid.com/examples/testing/hello-world/index.html');
|     });
|
|     it('should have expected column headers', () => {
|         element.all(by.css(".ag-header-cell-text"))
|             .map(function (header) {
|                 return header.getText()
|             }).then(function (headers) {
|                 expect(headers).toEqual(['Make', 'Model', 'Price']);
|             });
|     });
| });
| ```
|
| We can now run our test by executing the following command:
|
| ```bash
| ./node_modules/.bin/protractor conf.js
|
| # or if protractor is installed globally protractor conf.js
| ```
|
| ## Checking Grid Data
|
| We can match grid data by looking for rows by matching `div[row="<row id>"]` and then column
| values within these rows by looking for `div`'s with a class of `.ag-cell-value`:
|
| ```js
| it('first row should have expected grid data', () => {
|     element.all(by.css('div[row="0"] div.ag-cell-value'))
|         .map(function (cell) {
|             return cell.getText();
|         })
|         .then(function (cellValues) {
|             expect(cellValues).toEqual(["Toyota", "Celica", "35000"]);
|         });
| });
| ```
|
| We can add this to `spec.js` and run the tests as before.
|
| ## AG Grid Testing Utilities
|
| [[note]]
| | These utilities scripts should still be considered beta and are subject to change. Please provide feedback to
| | the <a href="https://github.com/seanlandsman/ag-grid-testing" target="_blank">GitHub</a> repository.
|
| Here at AG Grid we use a number of utility functions that make it easier for us to test AG Grid functionality.
|
| The utilities can be installed & imported as follows:
|
| Installing:
|
| ```bash
| npm install ag-grid-testing --save-dev
| ```
|
| Importing:
|
| ```js
| let ag_grid_utils = require("ag-grid-testing");
| ```
|
| ### verifyRowDataMatchesGridData
|
| Compares Grid data to provided data. The order of the data provided should correspond to the order within
| the grid. The property names should correspond to the `colId`'s of the columns.
|
| ```js
| ag_grid_utils.verifyRowDataMatchesGridData(
|     [
|         {
|             // first row
|             "name": "Amelia Braxton",
|             "proficiency": "42%",
|             "country": "Germany",
|             "mobile": "+960 018 686 075",
|             "landline": "+743 1027 698 318"
|         },
|         // more rows...
|     ]
| );
| ```
|
| ### verifyCellContentAttributesContains
|
| Useful when there is an array of data within a cell, each of which is writing an attribute (for example an image).
|
| ```js
| ag_grid_utils.verifyCellContentAttributesContains(1, "3", "src", ['android', 'mac', 'css'], "img");
| ```
|
| ### allElementsTextMatch
|
| Verifies that all elements text (ie the cell value) matches the provided data. Usf
|
| ```js
| ag_grid_utils.allElementsTextMatch(by.css(".ag-header-cell-text"),
|     ['#', 'Name', 'Country', 'Skills', 'Proficiency', 'Mobile', 'Land-line']
| );
| ```
|
| ### clickOnHeader
|
| Clicks on a header with the provided `headerName`.
|
| ```js
| ag_grid_utils.clickOnHeader("Name");
| ```
|
| ### getLocatorForCell
|
| Provides a CSS `Locator` for a grid cell, by row & id and optionally a further CSS selector.
|
| ```js
| ag_grid_utils.getLocatorForCell(0, "make")
| ag_grid_utils.getLocatorForCell(0, "make", "div.myClass")
| ```
|
| ### getCellContentsAsText
|
| Returns the cell value (as text) for by row & id and optionally a further CSS selector.
|
| ```js
| ag_grid_utils.getCellContentsAsText(0, "make")
|     .then(function(cellValue) {
|         // do something with cellValue
|     });
|
| ag_grid_utils.getCellContentsAsText(0, "make", "div.myClass")
|     .then(function(cellValue) {
|         // do something with cellValue
|     });
| ```

[[only-angular]]
| We will walk through how you can use testing AG Grid as part of your Angular application,
| using default build tools provided when using the [Angular CLI](https://cli.angular.io/).
|
| ## Configuring the Test Module
|
| The first thing we need to do is to add AG Grid's `AgGridModule` to the `TestBed.configureTestingModule`:
|
| ```ts
| beforeEach(async(() => {
|     TestBed.configureTestingModule({
|         imports: [
|             FormsModule,
|             AgGridModule
|         ],
|         declarations: [TestHostComponent]
|     }).compileComponents();
|
|     fixture = TestBed.createComponent(TestHostComponent);
|     component = fixture.componentInstance;
|
| }));
| ```
|
| Now that the test bed is aware of AG Grid we can continue with our testing. If however you wish
| to add any user provided components to the grid then you'll need to declare them here too.
|
| ```diff
| beforeEach(async(() => {
|     TestBed.configureTestingModule({
|         imports: [
|             FormsModule,
| +            AgGridModule
|         ],
| +        declarations: [TestHostComponent, RendererComponent, EditorComponent]
|     }).compileComponents();
|
|     fixture = TestBed.createComponent(TestHostComponent);
|     component = fixture.componentInstance;
| }));
| ```
|[[note]]
|| The `withComponents` call is only necessary for Angular <= v8 or if Ivy has been disabled (`enableIvy:false`).
|| If this is the case you must use `withComponents` to enable the grid to use Angular
|| components as cells / headers  otherwise you can ignore it and just import `AgGridModule`.
|
| ## Testing via the Grid API
|
| The grid's API will only be ready after `detectChanges` has been run:
|
| ```js
| it('grid API is not available until  `detectChanges`', () => {
|     expect(component.gridOptions.api).not.toBeTruthy();
| });
| ```
|
| ```js
| it('grid API is available after `detectChanges`', () => {
|     // Setup template bindings and run ngOInit. This causes the <ag-grid-angular> component to be created.
|     // As part of the creation the grid apis will be attached to the gridOptions property.
|     fixture.detectChanges();
|     expect(component.gridOptions.api).toBeTruthy();
| });
| ```
|
| ## Testing Grid Contents
|
| One way to check the grid contents is to access the `nativeElement` and query DOM elements from there:
|
| ```js
| it('the grid cells should be as expected', () => {
|
|     // Setup template bindings and run ngOInit. This causes the <ag-grid-angular> component to be created.
|     // As part of the creation the grid apis will be attached to the gridOptions property.
|     fixture.detectChanges();
|
|     const appElement = fixture.nativeElement;
|     const cellElements = appElement.querySelectorAll('.ag-cell-value');
|
|     expect(cellElements.length).toEqual(3);
|     expect(cellElements[0].textContent).toEqual("Test Name");
|     expect(cellElements[1].textContent).toEqual("42");
|     expect(cellElements[2].textContent).toEqual("84");
| });
| ```
|
| ## Testing User Supplied Components
|
| To test user supplied components you can access them via the grid API.
|
| For example, given the following code:
|
| ```tsx
| @Component({
|     selector: 'editor-cell',
|     template: `<input #input [(ngModel)]="value" style="width: 100%">`
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
|         `<div>
|             <ag-grid-angular
|                 style="width: 100%; height: 350px;" class="ag-theme-alpine"
|                 [columnDefs]="columnDefs"
|                 [rowData]="rowData"
|                 [stopEditingWhenCellsLoseFocus]="false"
|                 [components]="components"
|                 (gridReady)="onGridReady($event)">
|             </ag-grid-angular>
|         </div>`
| })
| class TestHostComponent {
|     rowData: any[] = [{name: 'Test Name', number: 42}];
|
|     columnDefs: ColDef[] = [
|         {field: "name"},
|         {field: "number", colId: "raw", headerName: "Raw Number", editable: true, cellEditor: 'editor'},
|         {field: "number", colId: "renderer", headerName: "Renderer Value"}
|     ];
|
|     components = {
|         'editor': EditorComponent
|     };
|
|     api: GridApi;
|     columnApi: ColumnApi;
|
|     public onGridReady(params: GridReadyEvent) {
|         this.api = params.api;
|         this.columnApi = params.columnApi;
|     }
| }
| ```
|
| We can test that the `EditorComponent` works as follows:
|
| ```js
| it('cell should be editable and editor component usable', () => {
|     // Setup template bindings and run ngOInit. This causes the <ag-grid-angular> component to be created.
|     // As part of the creation the grid apis will be attached to the gridOptions property.
|     fixture.detectChanges();
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
|     const appElement = fixture.nativeElement;
|     const cellElements = appElement.querySelectorAll('.ag-cell-value');
|     expect(cellElements.length).toEqual(3);
|     expect(cellElements[0].textContent).toEqual("Test Name");
|     expect(cellElements[1].textContent).toEqual("100");
|     expect(cellElements[2].textContent).toEqual("200");
| });
| ```
|
| ## Applying Styles To The Grid When Testing
|
| Although not strictly necessary when unit testing the grid, it is still useful to see the grid
| rendered when debugging. In order for this to work you need to provide the CSS to `karma.conf.js`:
|
| ```js
| // not strictly required for testing but useful when debugging the grid in action
| files: [
|     '../node_modules/ag-grid-community/dist/styles/ag-grid.css',
|     '../node_modules/ag-grid-community/dist/styles/ag-theme-alpine.css'
| ]
| ```
|
|
|## Next Up
|
|Continue to the next section to learn about [Testing with FakeAsync](/testing-async/) parts of the grid.

[[only-react]]
| We will walk through how you can use testing AG Grid as part of your React application, using default
| build tools provided when using the [Create React App](https://github.com/facebook/create-react-app) utility.
|
| ## Waiting for the Grid to be Initialised
|
| Due to the asynchronous nature of React we cannot simply mount the Grid and assume it'll be ready for
| testing in the next step - we need to wait for the Grid to be ready before testing it.
|
| We can do this in one of two ways - wait for the `gridReady` event to be fired, or wait for the
| Grid API to be set.
|
| The first requires a code change and can be tricky to hook into - the latter is unobtrusive and
| easier to use.
|
| We can create a utility function that will wait for the Grid API to be set for a set amount of time/attempts:
|
| ```js
| export const ensureGridApiHasBeenSet = component => {
|     return waitForAsyncCondition(() => {
|         return component.instance().api !== undefined
|     }, 5)
| };
|
| export const waitForAsyncCondition = (condition, maxAttempts, attempts = 0) => new Promise(function (resolve, reject) {
|     (function waitForCondition() {
|         // we need to wait for the gridReady event before we can start interacting with the grid
|         // in this case we're looking at the api property in our App component, but it could be
|         // anything (ie a boolean flag)
|         if (condition()) {
|             // once our condition has been met we can start the tests
|             return resolve();
|         }
|
|         attempts++;
|
|         if (attempts >= maxAttempts) {
|             reject("Max timeout waiting for condition")
|         }
|
|         // not set - wait a bit longer
|         setTimeout(waitForCondition, 10);
|     })();
| });
| ```
|
| The first function is what we'll use to wait for the Grid API - the 2nd one is more generic and will be
| useful for waiting for Grid components to be ready (see later).
|
| We can use `ensureGridApiHasBeenSet` before our tests are executed, typically in the `beforeEach`
| hook:
|
| ```jsx
| beforeEach((done) => {
|     component = mount((<GridWithStatefullComponent/>));
|     agGridReact = component.find(AgGridReact).instance();
|     // don't start our tests until the grid is ready
|     ensureGridApiHasBeenSet(component).then(() => done(), () => fail("Grid API not set within expected time limits"));
|
| });
|
| it('stateful component returns a valid component instance', () => {
|     expect(agGridReact.api).toBeTruthy();
|
|     // ..use the Grid API...
| });
| ```
|
| We can now safely test the Grid component safe in the knowledge that it's been fully initialised.
|
| ## Waiting for Grid Components to be Instantiated
|
| In the same way we need to wait for the Grid to be ready we also need to do something similar for user supplied
| Grid components.
|
| For example, let us suppose a user provides a custom [Editor Component](/component-cell-editor/) and wants
| to test this within the context of the Grid.
|
| ```jsx
| class EditorComponent extends Component {
|     constructor(props) {
|         super(props);
|
|         this.state = {
|             value: this.props.value
|         }
|     }
|
|     render() {
|         return (
|             <input type="text"
|                    value={this.state.value}
|                    onChange={this.handleChange}
|                    style={{width: "100%"}} />
|         )
|     }
|
|     handleChange = (event) => {
|         this.setState({value: event.target.value});
|     }
|
|     getValue() {
|         return this.state.value;
|     }
|
|     // for testing
|     setValue(newValue) {
|         this.setState({
|             value: newValue
|         })
|     }
|
|     isCancelBeforeStart() {
|         return false;
|     }
|
|     isCancelAfterEnd() {
|         return false;
|     };
| }
|
| class GridWithStatefullComponent extends Component {
|     constructor(props) {
|         super(props);
|
|         this.state = {
|             columnDefs: [{
|                 field: "age",
|                 editable: true,
|                 cellEditor: EditorComponent
|             }],
|             rowData: [{ age: 24 }]
|         };
|     }
|
|     onGridReady(params) {
|         this.api = params.api;
|     }
|
|     render() {
|         return (
|             <div className="ag-theme-balham">
|                 <AgGridReact
|                     columnDefs={this.state.columnDefs}
|                     onGridReady={this.onGridReady.bind(this)}
|                     rowData={this.state.rowData} />
|             </div>
|         );
|     }
| }
| ```
|
| We can now test this Editor Component by using the Grid API to initiate testing, gain access to the
| created Editor Instance and then invoke methods on it:
|
| ```js
| it('cell should be editable and editor component usable', async() => {
|     expect(component.render().find('.ag-cell-value').html()).toEqual(`<div>Age: 24</div>`);
|
|     // we use the API to start and stop editing
|     // in a real e2e test we could actually double click on the cell etc
|     agGridReact.api.startEditingCell({
|         rowIndex: 0,
|         colKey: 'age'
|     });
|
|     await waitForAsyncCondition(
|         () => agGridReact.api.getCellEditorInstances() &&
|               agGridReact.api.getCellEditorInstances().length > 0, 5)
|               .then(() => null, () => fail("Editor instance not created within expected time"));
|
|     const instances = agGridReact.api.getCellEditorInstances();
|     expect(instances.length).toEqual(1);
|
|     const editorComponent = instances[0];
|     editorComponent.setValue(50);
|
|     agGridReact.api.stopEditing();
|
|     await waitForAsyncCondition(
|         () => agGridReact.api.getCellRendererInstances() &&
|               agGridReact.api.getCellRendererInstances().length > 0, 5)
|               .then(() => null, () => fail("Renderer instance not created within expected time"));
|
|     expect(component.render().find('.ag-cell-value').html()).toEqual(`<div>Age: 50</div>`);
| });
| ```
|
| Note that we make use of the `waitForAsyncCondition` utility described above to wait for
| the Editor Component to be instantiated.
|
| We also use the Grid API to initiate and end testing as we're can't readily perform double clicks in a unit
| testing environment (but could if doing e2e with something like Protractor for example).
|
|##Testing React Hooks with Enzyme
|
|By default testing libraries won't return an accessible instance of a hook - in order to get access to methods you'll need
|to wrap your component with a `forwardRef` and then expose methods you want to test with the `useImperativeHandle` hook.
|
|```jsx
|import React, {forwardRef, useImperativeHandle, useState} from 'react';
|import {AgGridReact} from 'ag-grid-react';
|
|export default forwardRef(function (props, ref) {
|    const columnDefs = [...columns...];
|    const rowData = [...rowData...];
|
|    const [api, setApi] = useState(null);
|
|    const onGridReady = (params) => {
|        setApi(params.api);
|    };
|
|    useImperativeHandle(ref, () => {
|        return {
|            getApi() {
|                return api;
|            }
|        }
|    });
|
|    return (
|        <AgGridReact
|            columnDefs={columnDefs}
|            onGridReady={onGridReady}
|            rowData={rowData}
|        />
|    );
|});
|```
|
|You can then test this hook by accessing it via a `ref`:
|
|```jsx
|const ensureGridApiHasBeenSet = async (componentRef) => {
|    await act(async () => {
|        await new Promise(function (resolve, reject) {
|            (function waitForGridReady() {
|               // access the exposed "getApi" method on our hook
|                if (componentRef.current.getApi()) {
|                    if (componentRef.current.getApi().getRowNode(8)) {
|                        return resolve();
|                    }
|
|                }
|                setTimeout(waitForGridReady, 10);
|            })();
|        })
|
|    });
|};
|
|beforeEach(async () => {
|    const ref = React.createRef()
|    component = mount(<App ref={ref}/>);
|    agGridReact = component.find(AgGridReact).instance();
|    await ensureGridApiHasBeenSet(ref);
|});
|```
|
|Note that we're accessing exposed `getApi` method via the `ref`:  `componentRef.current.getApi()`.
|
|A full working example can be found in the following [GitHub Repo](https://github.com/seanlandsman/ag-grid-react-hook-testing).
|
[[only-vue]]
| We will walk through how you can use testing AG Grid as part of your Vue application, using default
| build tools provided when using the [Vue CLI](https://cli.vuejs.org/) utility.
|
| ## Waiting for the Grid to be Initialised
|
| Due to the asynchronous nature of React we cannot simply mount the Grid and assume it'll be ready
| for testing in the next step - we need to wait for the Grid to be ready before testing it.
|
| We can do this in one of two ways - wait for the `gridReady` event to be fired, or wait for the Grid API to be set.
|
| The first requires a code change and can be tricky to hook into - the latter is unobtrusive and easier to use.
|
| We can create a utility function that will wait for the Grid API to be set for a set amount of time/attempts:
|
| ```js
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
| ```
|
| We can now use this utility method before each test or in the `beforeEach` to ensure the Grid is fully ready
| before continuing with out test:
|
| ```js
| beforeEach((done) => {
|     wrapper = mount(GridExample, {});
|
|         // don't start our tests until the grid is ready
|         // it doesn't take long for the grid to initialise, but it is some finite amount of time
|         // after the component is ready
|         ensureGridApiHasBeenSet(wrapper.vm).then(() => done());
| });
| ```
|
| ## Testing User Supplied Components
|
| For example, let us suppose a user provides a custom [Editor Component](/component-cell-editor/) and wants
| to test this within the context of the Grid.
|
| ```jsx
| // Editor Component - Editor.vue
| <template>
|     <input v-model="value" type="number" style="width: 100%">
| </template>
|
| <script>
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
| </script>
|
| <template>
|     <ag-grid-vue style="width: 500px; height: 500px;"
|                  class="ag-theme-balham"
|                  @grid-ready="onGridReady"
|                  :columnDefs="columnDefs"
|                  :rowData="rowData">
|     </ag-grid-vue>
| </template>
|
| <script>
|     import {AgGridVue} from "@ag-grid-community/vue";
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
| </script>
| ```
|
| We can test the interaction between the Grid and the Editor component via the Grid API:
|
| ```js
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
| ```
|
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
| ```js
| module.exports = {
|   ...other configuration...
|   transformIgnorePatterns: ["/node_modules/(?!ag-grid-vue)"],
|   ..or, if using modules:
|   transformIgnorePatterns: ["/node_modules/(?!@ag-grid-community/vue)"],
| }
| ```
