<?php
$pageTitle = "ag-Grid Reference: Testing Techniques";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This reference pages covers methods for End to End - e2e - testing within our datagrid.";
$pageKeyboards = "ag-Grid react unit testing";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>


<h1>Testing ag-Grid in React Applications</h1>

<p>
    We will walk through how you can use testing ag-Grid as part of your React application, using default build tools provided
    when using the <a href="https://github.com/facebook/create-react-app">Create React App</a> utility.
</p>


<h2>Waiting for the Grid to be Initialised</h2>

<p>Due to the asynchronous nature of React we cannot simply mount the Grid and assume it'll be ready for testing in the 
    next step - we need to wait for the Grid to be ready before testing it.</p>

<p>We can do this in one of two ways - wait for the <code>gridReady</code> event to be fired, or wait for the Grid API to be set.</p>

<p>The first requires a code change and can be tricky to hook into - the latter is unobtrusive and easier to use.</p>

<p>We can create a utility function that will wait for the Grid API to be set for a set amount of time/attempts:</p>
<snippet>
export const ensureGridApiHasBeenSet = component =&gt; {
    return waitForAsyncCondition(() =&gt; {
        return component.instance().api !== undefined
    }, 5)
};

export const waitForAsyncCondition = (condition, maxAttempts, attempts=0) =&gt; new Promise(function (resolve, reject) {
    (function waitForCondition() {
        // we need to wait for the gridReady event before we can start interacting with the grid
        // in this case we're looking at the api property in our App component, but it could be
        // anything (ie a boolean flag)
        if (condition()) {
            // once our condition has been met we can start the tests
            return resolve();
        }
        attempts++;

        if(attempts &gt;= maxAttempts) {
            reject("Max timeout waiting for condition")
        }

        // not set - wait a bit longer
        setTimeout(waitForCondition, 10);
    })();
});
</snippet>

<p>The first function is what we'll use to wait for the Grid API - the 2nd one is more generic and will be useful for
waiting for Grid components to be ready (see later).</p>

<p>We can use <code>ensureGridApiHasBeenSet</code> before our tests are executed, typically in the <code>beforeEach</code>
hook:</p>

<snippet>
beforeEach((done) => {
    component = mount((<GridWithStatefullComponent/>));
    agGridReact = component.find(AgGridReact).instance();
    // don't start our tests until the grid is ready
    ensureGridApiHasBeenSet(component).then(() => done(), () => fail("Grid API not set within expected time limits"));

});

it('stateful component returns a valid component instance', () => {
    expect(agGridReact.api).toBeTruthy();

    ..use the Grid API...
});
</snippet>

<p>We can now safely test the Grid component safe in the knowledge that it's been fully initialised.</p>

<h2>Waiting for Grid Components to be Instantiated</h2>

<p>In the same way we need to wait for the Grid to be ready we also need to do something similar for user supplied
Grid components.</p>

<p>For example, let us suppose a user provides a custom <a href="../javascript-grid-cell-editor/">Editor Component</a> and wants
to test this within the context of the Grid.</p>

<snippet>
class EditorComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
    value: this.props.value
        }
    }

    render() {
        return (
            &lt;input type="text"
                   value={this.state.value}
                   onChange={this.handleChange}
                   style=<span ng-non-bindable>{</span>{width: "100%"}} /&gt;
        )
    }

    handleChange = (event) =&gt; {
        this.setState({value: event.target.value});
    }

    getValue() {
        return this.state.value;
    }

    // for testing
    setValue(newValue) {
        this.setState({
            value: newValue
        })
    }

    isCancelBeforeStart() {
        return false;
    }

    isCancelAfterEnd() {
        return false;
    };
}

class GridWithStatefullComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [{
                field: "age",
                editable: true,
                cellEditorFramework: EditorComponent
            }],
            rowData: [{age: 24}]
        };
    }

    onGridReady(params) {
        this.api = params.api;
    }

    render() {
        return (
            &lt;div
                className="ag-theme-balham"&gt;
                &lt;AgGridReact
                    columnDefs={this.state.columnDefs}
                    onGridReady={this.onGridReady.bind(this)}
                    rowData={this.state.rowData}
                    reactNext={true} /&gt;
            &lt;/div&gt;
        );
    }
}
</snippet>

<p>We can now test this Editor Component by using the Grid API to initiate testing, gain access to the created Editor Instance and
then invoke methods on it:</p>

<snippet>
it('cell should be editable and editor component usable', async() =&gt; {
    expect(component.render().find('.ag-cell-value').html()).toEqual(`&lt;div&gt;Age: 24&lt;/div&gt;`);

    // we use the API to start and stop editing
    // in a real e2e test we could actually double click on the cell etc
    agGridReact.api.startEditingCell({
        rowIndex: 0,
        colKey: 'age'
    });

    await waitForAsyncCondition(() =&gt; agGridReact.api.getCellEditorInstances() &&
                                      agGridReact.api.getCellEditorInstances().length &gt; 0, 5)
              .then(() =&gt; null, () =&gt; fail("Editor instance not created within expected time"));

    const instances = agGridReact.api.getCellEditorInstances();
    expect(instances.length).toEqual(1);

    const editorComponent = instances[0].getFrameworkComponentInstance();
    editorComponent.setValue(50);

    agGridReact.api.stopEditing();

    await waitForAsyncCondition(() =&gt; agGridReact.api.getCellRendererInstances() &&
                                      agGridReact.api.getCellRendererInstances().length &gt; 0, 5)
              .then(() =&gt; null, () =&gt; fail("Renderer instance not created within expected time"));

    expect(component.render().find('.ag-cell-value').html()).toEqual(`&lt;div&gt;Age: 50&lt;/div&gt;`);
});
</snippet>

<p>Note that we make use of the <code>waitForAsyncCondition</code> utility described above to wait for the Editor Component
    to be instantiated.</p>

<p>We also use the Grid API to initiate and end testing as we're can't readily perform double clicks in a unit testing environment (but could
if doing e2e with something like Protractor for example).</p>
<?php include '../documentation-main/documentation_footer.php'; ?>
