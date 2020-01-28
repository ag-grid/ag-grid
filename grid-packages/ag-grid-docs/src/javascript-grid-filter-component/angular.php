<h2 id="ng2Filtering"> Angular Filtering </h2>

<p>
    It is possible to provide Angular filters for ag-Grid to use if you are are using the
    Angular version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
    registering framework components</a> for how to register framework components.
</p>

<p>
    Your Angular components need to implement <code>AgFilterComponent</code>. The ag Framework expects to find the
    mandatory methods on the interface on the created component (and will call optional methods if they're present).
</p>

<h3 id="angular-params">Angular Params</h3>

<p>The ag Framework expects to find the <code>agInit</code> (on the <code>AgFilterComponent</code> interface) method on
    the created component, and uses it to supply the 'filter params'.</p>

<snippet>
agInit(params:IFilterParams):void {
    this.params = params;
    this.valueGetter = params.valueGetter;
}</snippet>

<h3 id="angular-methods-lifecycle">Angular Methods / Lifecycle</h3>

<p>
    All of the methods in the IFilter interface described above are applicable
    to the Angular Component with the following exceptions:
</p>

<ul class="content">
    <li><code>init()</code> is not used. Instead implement the <code>agInit</code> method (on the
        <code>AgRendererComponent</code> interface).
    </li>
    <li><code>destroy()</code> is not used. Instead implement the Angular<code>OnDestroy</code> interface
        (<code>ngOnDestroy</code>) for
        any cleanup you need to do.
    </li>
    <li><code>getGui()</code> is not used. Angular will provide the Gui via the supplied template.</li>
</ul>

<p>
    After that, all the other methods (<code>onNewRowsLoaded(), getModel(), setModel()</code> etc) behave the
    same so put them directly onto your Angular Component.
</p>

<h3 id="accessing-the-angular-component-instance">Accessing the Angular Component Instance</h3>

<p>
    ag-Grid allows you to get a reference to the filter instances via the <code>api.getFilterInstance(colKey)</code>
    method. If your component is a Angular component, then this will give you a reference to the ag-Grid's
    Component which wraps your Angular Component. Just like Russian Dolls. To get to the wrapped Angular instance
    of your component, use the <code>getFrameworkComponentInstance()</code> method as follows:
</p>

    <snippet>
// lets assume a Angular component as follows
@Component({
    selector: 'filter-cell',
    template: `
        Filter: &lt;input style="height: 10px" #input (ngModelChange)="onChange($event)" [ngModel]="text"&gt;
    `
})
class PartialMatchFilterComponent implements AgFilterComponent {

    ... // standard filter methods hidden

    // put a custom method on the filter
    myMethod() {
        // does something
    }
}

// then in your app, if you want to execute myMethod()...
laterOnInYourApplicationSomewhere() {

    // get reference to the ag-Grid Filter component
    let agGridFilter = api.getFilterInstance('name'); // assume filter on name column

    // get Angular instance from the ag-Grid instance
    let ng2FilterInstance = agGridFilter.getFrameworkComponentInstance();

    // now we're sucking diesel!!!
    ng2FilterInstance.myMethod();
}</snippet>

<h3 id="example-filtering-using-angular-components">Example: Filtering using Angular Components</h3>

<p>
    Using Angular Components as a partial text Filter in the "Filter Component" column, illustrating filtering and
    lifecycle events.
</p>
<?= example('Angular Filter Component', 'filter-component', 'generated', array('enterprise' => false, "exampleHeight" => 445, 'onlyShow' => 'angular', 'extras' => array("bootstrap"))) ?>

