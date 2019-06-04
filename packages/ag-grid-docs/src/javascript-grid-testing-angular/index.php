<?php
$pageTitle = "ag-Grid Reference: Testing Techniques";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This reference pages covers methods for End to End - e2e - testing within our datagrid.";
$pageKeyboards = "ag-Grid angular unit testing";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>


<h1>Testing ag-Grid in Angular Applications</h1>

<p>
    We will walk through how you can use testing ag-Grid as part of your Angular application, using default build tools provided
    when using the <a href="https://cli.angular.io/">Angular CLI</a>.
</p>


<h2>Configuring the Test Module</h2>

<p>The first thing we need to do is to add ag-Grid's <code>AgGridModule</code> to the <code>TestBed.configureTestingModule(</code>:</p>

<snippet>
beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
            FormsModule,
            AgGridModule.withComponents([])
        ],
        declarations: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
}));
</snippet>

<p>Now that the test bed is aware of ag-Grid we can continue with our testing. If however you wish to add any user provided
components to the grid then you'll need to declare them here too:</p>

<snippet language="diff">
beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
            FormsModule,
+            AgGridModule.withComponents([RendererComponent, EditorComponent])
        ],
+        declarations: [TestHostComponent, RendererComponent, EditorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
}));
</snippet>

<p>Here were initialising the test bed before each test for convenience.</p>

<h2>Testing via the Grid API</h2>

<p>The grid's API will only be ready after <code>detectChanges</code> has been run:</p>

<snippet>
it('grid API is not available until  `detectChanges`', () =&gt; {
    expect(component.gridOptions.api).not.toBeTruthy();
});

it('grid API is available after `detectChanges`', () =&gt; {
    fixture.detectChanges();
    expect(component.gridOptions.api).toBeTruthy();
});</snippet>

<h2>Testing Grid Contents</h2>

<p>The easiest way to check the grid contents is to access the <code>nativeElement</code> and query DOM elements from there:</p>

<snippet>
it('the grid cells should be as expected', () => {
    const appElement = fixture.nativeElement;

    const cellElements = appElement.querySelectorAll('.ag-cell-value');
    expect(cellElements.length).toEqual(3);
    expect(cellElements[0].textContent).toEqual("Test Name");
    expect(cellElements[1].textContent).toEqual("42");
    expect(cellElements[2].textContent).toEqual("84");
});
</snippet>

<h2>Testing User Supplied Components</h2>

<p>The easiest way to test user supplied components is to access them via <code>getFrameworkComponentInstance</code>.</p>

<p>For example, given the following code:</p>

<snippet>
&#64;Component(<span ng-non-bindable>{</span>
    selector: 'editor-cell',
    template: `&lt;input #input [(ngModel)]="value" style="width: 100%"&gt;`
<span ng-non-bindable>}</span>)
export class EditorComponent implements ICellEditorAngularComp {
    private params: any;
    public value: number;

    @ViewChild('input', {read: ViewContainerRef}) public input;

    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;
    }

    getValue(): any {
        return this.value;
    }

    // for testing
    setValue(newValue: any) {
        this.value = newValue;
    }

    isCancelBeforeStart(): boolean {
        return false;
    }

    isCancelAfterEnd(): boolean {
        return false;
    };
}

@Component({
    template: `
        &lt;div&gt;
            &lt;ag-grid-angular style="width: 100%; height: 350px;" class="ag-theme-balham"
                             [columnDefs]="columnDefs"
                             [rowData]="rowData"

                             [stopEditingWhenGridLosesFocus]="false"

                             [frameworkComponents]="frameworkComponents"

                             (gridReady)="onGridReady($event)"&gt;
            &lt;/ag-grid-angular&gt;
        &lt;/div&gt;`
})
class TestHostComponent {
    rowData: any[] = [{name: 'Test Name', number: 42}];

    columnDefs: any[] = [
        {field: "name"},
        {field: "number", colId: "raw", headerName: "Raw Number", editable: true, cellEditor: 'editor'},
        {field: "number", colId: "renderer", headerName: "Renderer Value"}
    ];

    frameworkComponents = {
        'editor': EditorComponent
    };

    api: GridApi;
    columnApi: ColumnApi;

    public onGridReady(params) {
        this.api = params.api;
        this.columnApi = params.columnApi;
    }
}
</snippet>

<p>We can test that the <code>EditocComponent</code> works as follows:</p>

<snippet>
it('cell should be editable and editor component usable', () => {
    // we use the API to start and stop editing - in a real e2e test we could actually double click on the cell etc
    component.api.startEditingCell({
            rowIndex: 0,
            colKey: 'raw'
        });

    const instances = component.api.getCellEditorInstances();
    expect(instances.length).toEqual(1);

    const editorComponent = instances[0].getFrameworkComponentInstance();
    editorComponent.setValue(100);

    component.api.stopEditing();

    const appElement = fixture.nativeElement;
    const cellElements = appElement.querySelectorAll('.ag-cell-value');
    expect(cellElements.length).toEqual(3);
    expect(cellElements[0].textContent).toEqual("Test Name");
    expect(cellElements[1].textContent).toEqual("100");
    expect(cellElements[2].textContent).toEqual("200");
});
</snippet>

<h2>Applying Styles To The Grid When Testing</h2>

<p>Although not strictly necessary when unit testing the grid, it is still useful to see the grid rendered when debugging.
    In order for this to work you need to provide the CSS to <code>karma.conf.js</code>:</p>

<snippet>
// not strictly required for testing but useful when debugging the grid in action
files: [
    '../node_modules/ag-grid-community/dist/styles/ag-grid.css',
    '../node_modules/ag-grid-community/dist/styles/ag-theme-balham.css'
]
</snippet>
<?php include '../documentation-main/documentation_footer.php'; ?>
