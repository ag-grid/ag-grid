<p>
    <h2 id="polymerFiltering">
        <img src="../images/polymer-large.png" style="width: 60px"/>
        Polymer Filtering
    </h2>

    <div class="note" style="margin-bottom: 20px">
        <img align="left" src="../images/note.png" style="margin-right: 10px;" />
        <p>This section explains how to create an ag-Grid Filter using Polymer. You should read about how
        <a href="../javascript-grid-filter-component/">Filters Components</a> work in ag-Grid first before trying to
        understand this section.</p>
    </div>

    <p>
        It is possible to provide a Polymer Component filter for ag-Grid to use. All of the information above is
        relevant to Polymer filters. This section explains how to apply this logic to your Polymer component.
    </p>

    <p>
        For an example on Polymer filtering, see the
        <a href="https://github.com/ag-grid/ag-grid-polymer-example">ag-grid-polymer-example</a> on Github.</p>
    </p>

    <h3 id="specifying-a-polymer-filter"><img src="../images/polymer-large.png" style="width: 20px;"/> Specifying a Polymer Filter</h3>

    <p>
        If you are using the ag-grid-polymer component to create the ag-Grid instance,
        then you will have the option of additionally specifying the filters
        as Polymer components.
    </p>

    <pre ng-non-bindable><span class="codeComment">// create your filter as a Polymer component</span>
&lt;dom-module id="partial-match-filter"&gt;
    &lt;template&gt;
        Filter: &lt;input style="height: 20px" id="input" on-input="onChange" value="{{text::input}}"&gt;
    &lt;/template&gt;

    &lt;script&gt;
        class PartialMatchFilter extends Polymer.Element {
            static get is() {
                return 'partial-match-filter'
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
                    .every((filterWord) =&gt; {
                        return this.valueGetter(params.node).toString().toLowerCase().indexOf(filterWord) &gt;= 0;
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

        customElements.define(PartialMatchFilter.is, PartialMatchFilter);
    &lt;/script&gt;
&lt;/dom-module&gt;

<span class="codeComment">// then reference the Component in your colDef like this</span>
colDef = {

    <span class="codeComment">// we use cellRendererFramework instead of cellRenderer </span>
    filterFramework: 'partial-match-filter'

    <span class="codeComment">// specify all the other fields as normal</span>
    headerName: 'Name',
    field: 'firstName',
    ...
}</pre>

    <p>Your Polymer components need to implement <code>IFilter</code>. The ag Framework expects to find the
        mandatory methods on the interface on the created component (and will call optional methods if they're present)
        as well as <code>agInit</code>, which the grid uses to provide initial state & parameters.</p>

    <p>
        By using <i>colDef.filterFramework</i> (instead of <i>colDef.filter</i>) the grid
        will know it's a Polymer component, based on the fact that you are using the Polymer version of
        ag-Grid.
    </p>

    <h3 id="polymer-params"><img src="../images/polymer-large.png" style="width: 20px;"/> Polymer Params</h3>

    <p>The ag Framework expects to find the <code>agInit</code> method on the created component, and uses it to supply the 'filter params'.</p>

    <pre>
agInit(params:IFilterParams):void {
    this.params = params;
    this.valueGetter = params.valueGetter;
}</pre>
    </p>

    <h3 id="polymer-methods-lifecycle"><img src="../images/polymer-large.png" style="width: 20px;"/> Polymer Methods / Lifecycle</h3>

    <p>
        All of the methods in the IFilter interface described above are applicable
        to the Polymer Component with the following exceptions:
    <ul>
        <li><i>init()</i> is not used. Instead implement the <code>agInit</code> method (on the <code>AgRendererComponent</code> interface).</li>
        <li><i>getGui()</i> is not used. Polymer will provide the Gui via the supplied template.</li>
    </ul>

    <p>
        After that, all the other methods (<i>onNewRowsLoaded(), getModel(), setModel()</i> etc) behave the
        same so put them directly onto your Polymer Component.
    </p>

    <h3 id="accessing-the-polymer-component-instance"><img src="../images/polymer-large.png" style="width: 20px;"/> Accessing the Polymer Component Instance</h3>

    <p>
        ag-Grid allows you to get a reference to the filter instances via the <i>api.getFilterInstance(colKey)</i>
        method. If your component is a Polymer component, then this will give you a reference to the ag-Grid's
        Component which wraps your Polymer Component. Just like Russian Dolls. To get to the wrapped Polymer instance
        of your component, use the <i>getFrameworkComponentInstance()</i> method as follows:
        <pre ng-non-bindable><span class="codeComment">// lets assume a Polymer component as follows</span>
&lt;dom-module id="partial-match-filter"&gt;
    &lt;template&gt;
        Filter: &lt;input style="height: 20px" id="input" on-input="onChange" value="{{text::input}}"&gt;
    &lt;/template&gt;

    &lt;script&gt;
        class PartialMatchFilter extends Polymer.Element {
    ... <span class="codeComment">// standard filter methods hidden</span>

    <span class="codeComment">// put a custom method on the filter</span>
    componentMethod() {
        <span class="codeComment">// does something</span>
    }
}

<span class="codeComment">// then in your app, if you want to execute myMethod()...</span>
laterOnInYourApplicationSomewhere() {

    <span class="codeComment">// get reference to the ag-Grid Filter component</span>
    let agGridFilter = this.gridOptions.api.getFilterInstance("name");
    let agGridFilter = api.getFilterInstance('name'); <span class="codeComment">// assume filter on name column</span>

    <span class="codeComment">// get Polymer instance from the ag-Grid instance</span>
    let polymerFilterInstance = getFrameworkComponentInstance();

    <span class="codeComment">// now we're sucking diesel!!!</span>
    polymerFilterInstance.componentMethod("Hello World!");
}</pre>
    </p>

    <h3 id="example-filtering-using-polymer-components"><img src="../images/polymer-large.png" style="width: 20px;"/> Example: Filtering using Polymer Components</h3>
    <p>
        Using Polymer Components as a partial text Filter in the "Filter Component" column, illustrating filtering and lifecycle events.
    </p>
<show-complex-example example="../polymer-examples/src/filter-components-example/index.html"
                      sources="{
                            [
                                { root: '/polymer-examples/src/filter-components-example/', files: 'index.html,filter-components-example.html,partial-match-filter.html' }
                            ]
                          }"
                      exampleHeight="525px">
</show-complex-example>
