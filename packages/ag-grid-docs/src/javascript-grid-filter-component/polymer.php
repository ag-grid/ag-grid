
    <h2>Polymer Filtering</h2>

    <p>
        It is possible to provide Polymer filters for ag-Grid to use if you are are using the
        Polymer version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
        registering framework components</a> for how to register framework components.
    </p>

    <h3 id="specifying-a-polymer-filter"> Specifying a Polymer Filter</h3>

    <p>
        If you are using the ag-grid-polymer component to create the ag-Grid instance,
        then you will have the option of additionally specifying the filters
        as Polymer components.
    </p>

<snippet >
// create your filter as a Polymer component
export default class PartialMatchFilter extends PolymerElement {
    static get template() {
        return html`
        Filter: &lt;input style="height: 20px" id="input" on-input="onChange"
        <span ng-non-bindable>value="{{text::input}}"</span>&gt;
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
        return this.text !== null && this.text !== undefined && this.text !== '';
    }

    doesFilterPass(params) {
        return this.text.toLowerCase()
            .split(" ")
            .every((filterWord) => {
                return this.valueGetter(params.node).toString().toLowerCase().indexOf(filterWord) >= 0;
            });
    }

    getModel() {
        return {value: this.text};
    }

    setModel(model) {
        this.text = model ? model.value : '';
    }

    afterGuiAttached(params) {
        this.$.input.focus();
    }

    componentMethod(message) {
        alert(`Alert from PartialMatchFilterComponent ${message}`);
    }

    onChange(event) {
        let newValue = event.target.value;
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
</snippet>

    <p>
        Your Polymer components need to implement <code>IFilter</code>. The ag Framework expects to find the
        mandatory methods on the interface on the created component (and will call optional methods if they're present)
        as well as <code>agInit</code>, which the grid uses to provide initial state & parameters.
    </p>

    <h3 id="polymer-params">Polymer Params</h3>

    <p>The ag Framework expects to find the <code>agInit</code> method on the created component, and uses it to supply the 'filter params'.</p>

<snippet>
agInit(params:IFilterParams):void {
    this.params = params;
    this.valueGetter = params.valueGetter;
}</snippet>


    <h3 id="polymer-methods-lifecycle">Polymer Methods / Lifecycle</h3>

    <p>
        All of the methods in the IFilter interface described above are applicable
        to the Polymer Component with the following exceptions:
</p>

    <ul class="content">
        <li><code>init()</code> is not used. Instead implement the <code>agInit</code> method (on the <code>AgRendererComponent</code> interface).</li>
        <li><code>getGui()</code> is not used. Polymer will provide the Gui via the supplied template.</li>
    </ul>

    <p>
        After that, all the other methods (<code>onNewRowsLoaded(), getModel(), setModel()</code> etc) behave the
        same so put them directly onto your Polymer Component.
    </p>

    <h3 id="accessing-the-polymer-component-instance"> Accessing the Polymer Component Instance</h3>

    <p>
        ag-Grid allows you to get a reference to the filter instances via the <code>api.getFilterInstance(colKey)</code>
        method. If your component is a Polymer component, then this will give you a reference to the ag-Grid's
        Component which wraps your Polymer Component. Just like Russian Dolls. To get to the wrapped Polymer instance
        of your component, use the <code>getFrameworkComponentInstance()</code> method as follows:
</p>
<snippet language="js">
// lets assume a Polymer component as follows
export default class PartialMatchFilter extends PolymerElement {
    static get template() {
        return html`
            Filter: &lt;input style="height: 20px" id="input" on-input="onChange"
            <span ng-non-bindable>value="{{text::input}}"</span>&gt;
        `;
    }
    ... // standard filter methods hidden

    // put a custom method on the filter
    componentMethod() {
        // does something
    }
}

// then in your app, if you want to execute myMethod()...
laterOnInYourApplicationSomewhere() {

    // get reference to the ag-Grid Filter component
    let agGridFilter = this.gridOptions.api.getFilterInstance("name");
    // assume filter on name column
    let agGridFilter = api.getFilterInstance('name'); 

    // get Polymer instance from the ag-Grid instance
    let polymerFilterInstance = getFrameworkComponentInstance();

    // now we're sucking diesel!!!
    polymerFilterInstance.componentMethod("Hello World!");
}
</snippet>

    <h3 id="example-filtering-using-polymer-components"> Example: Filtering using Polymer Components</h3>

    <p>
        Using Polymer Components as a partial text Filter in the "Filter Component" column, illustrating filtering and lifecycle events.
    </p>
<?= example('Polymer Filter Component', 'polymer-filter', 'as-is', array("noPlunker" => 1, "usePath" => "/", "exampleHeight" => 360)) ?>

