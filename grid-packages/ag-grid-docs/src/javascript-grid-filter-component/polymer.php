<h2>Polymer Filtering</h2>

<p>
    It is possible to provide Polymer filters for ag-Grid to use if you are are using the
    Polymer version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
    registering framework components</a> for how to register framework components.
</p>

<h3 id="specifying-a-polymer-filter"> Specifying a Polymer Filter</h3>

<p>
    If you are using the <code>ag-grid-polymer</code> component to create the ag-Grid instance,
    then you will have the option of additionally specifying the filters as Polymer components.
</p>

<?= createSnippet(<<<SNIPPET
// create your filter as a Polymer component
export default class PartialMatchFilter extends PolymerElement {
    static get template() {
        return html`
        Filter: <input style="height: 20px" id="input" on-input="onChange" value="{{text::input}}">
        `;
    }

    agInit(params) {
        this.params = params;
        this.valueGetter = params.valueGetter;
    }

    static get properties() {
        return {
            text: String
        };
    }

    isFilterActive() {
        return this.text != null && this.text !== '';
    }

    doesFilterPass(params) {
        return this.text.toLowerCase()
            .split(" ")
            .every(filterWord => this.valueGetter(params.node).toString().toLowerCase().indexOf(filterWord) >= 0);
    }

    getModel() {
        return {value: this.text};
    }

    setModel(model) {
        this.text = model ? model.value : '';
    }

    afterGuiAttached(params) {
        this.\$.input.focus();
    }

    onChange(event) {
        const newValue = event.target.value;

        if (this.text !== newValue) {
            this.text = newValue;
            this.params.filterChangedCallback();
        }
    }
}

customElements.define('partial-match-filter', PartialMatchFilter);

// then reference the Component in your colDef like this
colDef = {
    // we use cellRendererFramework instead of cellRenderer
    filterFramework: 'partial-match-filter'

    // specify all the other fields as normal
    headerName: 'Name',
    field: 'firstName',
    ...
}
SNIPPET
) ?>

<p>
    Your Polymer components need to implement <code>IFilterComp</code>. The ag Framework expects to find the
    mandatory methods on the interface on the created component (and will call optional methods if they're present)
    as well as <code>agInit</code>, which the grid uses to provide initial state and parameters.
</p>

<h3 id="polymer-params">Polymer Params</h3>

<p>The ag Framework expects to find the <code>agInit</code> method on the created component, and uses it to supply the 'filter params'.</p>

<?= createSnippet(<<<SNIPPET
agInit(params: IFilterParams): void {
    this.params = params;
    this.valueGetter = params.valueGetter;
}
SNIPPET
, 'ts') ?>

<h3 id="polymer-methods-lifecycle">Polymer Methods / Lifecycle</h3>

<p>
    All of the methods in the <code>IFilterComp</code> interface described above are applicable
    to the Polymer Component with the following exceptions:
</p>

<ul class="content">
    <li><code>init()</code> is not used. Instead implement the <code>agInit</code> method (on the <code>AgRendererComponent</code> interface).</li>
    <li><code>getGui()</code> is not used. Polymer will provide the GUI via the supplied template.</li>
</ul>

<p>
    After that, all the other methods (<code>onNewRowsLoaded()</code>, <code>getModel()</code>, <code>setModel()</code> etc.) behave the
    same, so put them directly onto your Polymer Component.
</p>

<h3 id="accessing-the-polymer-component-instance">Accessing the Polymer Component Instance</h3>

<p>
    ag-Grid allows you to get a reference to the filter instances via the <code>api.getFilterInstance(colKey)</code>
    method. If your component is a Polymer component, then this will give you a reference to ag-Grid's
    component which wraps your Polymer component, just like Russian Dolls. To get to the wrapped Polymer instance
    of your component, use the <code>getFrameworkComponentInstance()</code> method as follows:
</p>

<?= createSnippet(<<<SNIPPET
// let's assume a Polymer component as follows
export default class PartialMatchFilter extends PolymerElement {
    static get template() {
        return html`
            Filter: <input style="height: 20px" id="input" on-input="onChange" value="{{text::input}}">

        `;
    }
    ... // standard filter methods hidden

    // put a custom method on the filter
    myMethod() {
        // does something
    }
}

// later in your app, if you want to execute myMethod()...
laterOnInYourApplicationSomewhere() {
    // get reference to the ag-Grid Filter component
    const agGridFilterInstance = this.gridOptions.api.getFilterInstance('name');

    // get Polymer instance from the ag-Grid instance
    const polymerFilterInstance = agGridFilterInstance.getFrameworkComponentInstance();

    // now we're sucking diesel!!!
    polymerFilterInstance.myMethod();
}
SNIPPET
) ?>

<h3 id="example-filtering-using-polymer-components">Example: Filtering using Polymer Components</h3>

<p>
    Using Polymer Components as a partial text filter in the Name column, illustrating filtering and lifecycle events.
</p>

<?= grid_example('Polymer Filter Component', 'polymer-filter', 'as-is', ['showImportsDropdown' => false, 'noPlunker' => true, 'usePath' => '/', 'exampleHeight' => 360]) ?>
