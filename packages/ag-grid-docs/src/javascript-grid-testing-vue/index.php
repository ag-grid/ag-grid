<?php
$pageTitle = "ag-Grid Reference: Testing Techniques";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This reference pages covers methods for End to End - e2e - testing within our datagrid.";
$pageKeyboards = "ag-Grid vue unit testing";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>


<h1>Testing ag-Grid in Vue.js Applications</h1>

<p>
    We will walk through how you can use testing ag-Grid as part of your Vue application, using default build tools provided
    when using the <a href="https://cli.vuejs.org/">Vue CLI</a> utility.
</p>

<h2>Waiting for the Grid to be Initialised</h2>

<p>Due to the asynchronous nature of React we cannot simply mount the Grid and assume it'll be ready for testing in the
    next step - we need to wait for the Grid to be ready before testing it.</p>

<p>We can do this in one of two ways - wait for the <code>gridReady</code> event to be fired, or wait for the Grid API to be set.</p>

<p>The first requires a code change and can be tricky to hook into - the latter is unobtrusive and easier to use.</p>

<p>We can create a utility function that will wait for the Grid API to be set for a set amount of time/attempts:</p>

<snippet>
const ensureGridApiHasBeenSet = vm => new Promise(function (resolve, reject) {
    (function waitForGridReady() {
        // we need to wait for the gridReady event before we can start interacting with the grid
        // in this case we're looking at the api property in our App component,
        // but it could be anything (ie a boolean flag)
        if (vm.$data.api) {
            // once our condition has been met we can start the tests
            return resolve();
        }

        // not set - wait a bit longer
        setTimeout(waitForGridReady, 10);
    })();
});
</snippet>

<p>We can no use this utility method before each test or in the <code>beforeEach</code> to ensure the Grid is fully ready
before continuing with out test:</p>

<snippet>
beforeEach((done) => {
    wrapper = mount(GridExample, {});

        // don't start our tests until the grid is ready
        // it doesn't take long for the grid to initialise, but it is some finite amount of time
        // after the component is ready
        ensureGridApiHasBeenSet(wrapper.vm).then(() => done());
});
</snippet>

<h2>Testing User Supplied Components</h2>

<p>For example, let us suppose a user provides a custom <a href="../javascript-grid-cell-editor/">Editor Component</a> and wants
    to test this within the context of the Grid.</p>

<snippet>
// Editor Component - Editor.vue
&lt;template&gt;
    &lt;input v-model="value" type="number" style="width: 100%"&gt;
&lt;/template&gt;

&lt;script&gt;
    export default {
        name: 'Editor',
        data() {
            return {
                value: null
            }
        },
        beforeMount() {
            this.value = this.params.value;
        },
        methods: {
            getValue() {
                return this.value;
            },

            // for testing
            setValue(newValue) {
                this.value = newValue;
            },

            isCancelBeforeStart() {
                return false;
            },

            isCancelAfterEnd() {
                return false;
            }
        }
    }
&lt;/script&gt;
    
&lt;template&gt;
    &lt;ag-grid-vue style="width: 500px; height: 500px;"
                 class="ag-theme-balham"
                 @grid-ready="onGridReady"
                 :columnDefs="columnDefs"
                 :rowData="rowData"&gt;
    &lt;/ag-grid-vue&gt;
&lt;/template&gt;

&lt;script&gt;
    import {AgGridVue} from "ag-grid-vue";
    import Editor from './Editor.vue';

    export default {
        name: 'App',
        data() {
            return {
                columnDefs: null,
                rowData: null,
                api: null
            }
        },
        components: {
            AgGridVue,
            Editor
        },
        beforeMount() {
            this.columnDefs = [
                {field: 'make'},
                {
                    field: 'price',
                    editable: true,
                    cellEditorFramework: 'Editor'
                }
            ];

            this.rowData = [
                {make: 'Toyota', price: '35000'},
            ];
        },
        methods: {
            onGridReady(params) {
                this.api = params.api;
            }
        }
    }
&lt;/script&gt;
</snippet>

<p>We can test the interaction between the Grid and the Editor component via the Grid API:</p>

<snippet>
it('grid renders as expected', () => {
    const cells = wrapper.findAll('.ag-cell-value');
    expect(cells.length).toEqual(2);

    expect(cells.at(0).text()).toEqual('Toyota');
    expect(cells.at(1).text()).toEqual('70000');
});

it('cell should be editable and editor component usable', () => {
    // wait for the api to be set before continuing
    const componentInstance = wrapper.vm;

    const api = componentInstance.$data.api;

    // we use the API to start and stop editing - in a real e2e test we could actually
    // double click on the cell etc
    api.startEditingCell({
        rowIndex: 0,
        colKey: 'price'
    });

    // update the editor input
    const textInput = wrapper.find('input[type="number"]');
    textInput.setValue(100000);

    // stop editing
    api.stopEditing();

    // test the resulting values in the grid (the edited cell value should have changed)
    const cells = wrapper.findAll('.ag-cell-value');
    expect(cells.length).toEqual(2);

    expect(cells.at(0).text()).toEqual('Toyota');
    expect(cells.at(1).text()).toEqual('200000');
});
</snippet>

<p>We use the Grid API to initiate and end testing as we're can't readily perform double clicks in a unit testing environment (but could
    if doing e2e with something like Protractor for example).</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
