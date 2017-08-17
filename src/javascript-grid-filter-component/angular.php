<p>

    <!-- start of angular -->
    <h2 id="ng2Filtering">
        <img src="../images/angular2_large.png" style="width: 60px"/>
        Angular Filtering
    </h2>

    <div class="note" style="margin-bottom: 20px">
        <img align="left" src="../images/note.png" style="margin-right: 10px;" />
        <p>This section explains how to create an ag-Grid Filter using Angular. You should read about how
        <a href="../javascript-grid-filter-component/">Filters Components</a> work in ag-Grid first before trying to
        understand this section.</p>
    </div>

    <p>
        It is possible to provide a Angular Component filter for ag-Grid to use. All of the information above is
        relevant to Angular filters. This section explains how to apply this logic to your Angular component.
    </p>

    <p>
        For an example on Angular filtering, see the
        <a href="https://github.com/ag-grid/ag-grid-angular-example">ag-grid-angular-example</a> on Github.</p>
    </p>

    <h3 id="specifying-a-angular-filter"><img src="../images/angular2_large.png" style="width: 20px;"/> Specifying a Angular Filter</h3>

    <p>
        If you are using the ag-grid-angular component to create the ag-Grid instance,
        then you will have the option of additionally specifying the filters
        as Angular components.
    </p>

    <pre ng-non-bindable><span class="codeComment">// create your filter as a Angular component</span>
@Component({
    selector: 'filter-cell',
    template: `
        Filter: &lt;input style="height: 10px" #input (ngModelChange)="onChange($event)" [ngModel]="text">
    `
})
class PartialMatchFilterComponent implements AgFilterComponent {
    private params:IFilterParams;
    private valueGetter:(rowNode:RowNode) => any;
    private text:string = '';

    @ViewChild('input', {read: ViewContainerRef}) private input;

    agInit(params:IFilterParams):void {
        this.params = params;
        this.valueGetter = params.valueGetter;
    }

    isFilterActive():boolean {
        return this.text !== null && this.text !== undefined && this.text !== '';
    }

    doesFilterPass(params:IDoesFilterPassParams):boolean {
        return this.text.toLowerCase()
            .split(" ")
            .every((filterWord) => {
                return this.valueGetter(params.node).toString().toLowerCase().indexOf(filterWord) >= 0;
            });
    }

    getModel():any {
        return {value: this.text};
    }

    setModel(model:any):void {
        this.text = model.value;
    }

    afterGuiAttached(params:IAfterFilterGuiAttachedParams):void {
        this.input.element.nativeElement.focus();
    }

    componentMethod(message:string) : void {
        alert(`Alert from PartialMatchFilterComponent ${message}`);
    }

    onChange(newValue):void {
        if (this.text !== newValue) {
            this.text = newValue;
            this.params.filterChangedCallback();
        }
    }
}

<span class="codeComment">// then reference the Component in your colDef like this</span>
colDef = {

    <span class="codeComment">// we use cellRendererFramework instead of cellRenderer </span>
    filterFramework: PartialMatchFilterComponent

    <span class="codeComment">// specify all the other fields as normal</span>
    headerName: 'Name',
    field: 'firstName',
    ...
}</pre>

    <p>Your Angular components need to implement <code>AgFilterComponent</code>. The ag Framework expects to find the
        mandatory methods on the interface on the created component (and will call optional methods if they're present).</p>

    <p>
        By using <i>colDef.filterFramework</i> (instead of <i>colDef.filter</i>) the grid
        will know it's a Angular component, based on the fact that you are using the Angular version of
        ag-Grid.
    </p>

    <h3 id="angular-params"><img src="../images/angular2_large.png" style="width: 20px;"/> Angular Params</h3>

    <p>The ag Framework expects to find the <code>agInit</code> (on the <code>AgFilterComponent</code> interface) method on the created component, and uses it to supply the 'filter params'.</p>

    <pre>
agInit(params:IFilterParams):void {
    this.params = params;
    this.valueGetter = params.valueGetter;
}</pre>
    </p>

    <h3 id="angular-methods-lifecycle"><img src="../images/angular2_large.png" style="width: 20px;"/> Angular Methods / Lifecycle</h3>

    <p>
        All of the methods in the IFilter interface described above are applicable
        to the Angular Component with the following exceptions:
    <ul>
        <li><i>init()</i> is not used. Instead implement the <code>agInit</code> method (on the <code>AgRendererComponent</code> interface).</li>
        <li><i>destroy()</i> is not used. Instead implement the Angular<code>OnDestroy</code> interface (<code>ngOnDestroy</code>) for
            any cleanup you need to do.</li>
        <li><i>getGui()</i> is not used. Angular will provide the Gui via the supplied template.</li>
    </ul>

    <p>
        After that, all the other methods (<i>onNewRowsLoaded(), getModel(), setModel()</i> etc) behave the
        same so put them directly onto your Angular Component.
    </p>

    <h3 id="accessing-the-angular-component-instance"><img src="../images/angular2_large.png" style="width: 20px;"/> Accessing the Angular Component Instance</h3>

    <p>
        ag-Grid allows you to get a reference to the filter instances via the <i>api.getFilterInstance(colKey)</i>
        method. If your component is a Angular component, then this will give you a reference to the ag-Grid's
        Component which wraps your Angular Component. Just like Russian Dolls. To get to the wrapped Angular instance
        of your component, use the <i>getFrameworkComponentInstance()</i> method as follows:
        <pre><span class="codeComment">// lets assume a Angular component as follows</span>
@Component({
    selector: 'filter-cell',
    template: `
        Filter: &lt;input style="height: 10px" #input (ngModelChange)="onChange($event)" [ngModel]="text">
    `
})
class PartialMatchFilterComponent implements AgFilterComponent {

    ... <span class="codeComment">// standard filter methods hidden</span>

    <span class="codeComment">// put a custom method on the filter</span>
    myMethod() {
        <span class="codeComment">// does something</span>
    }
}

<span class="codeComment">// then in your app, if you want to execute myMethod()...</span>
laterOnInYourApplicationSomewhere() {

    <span class="codeComment">// get reference to the ag-Grid Filter component</span>
    let agGridFilter = api.getFilterInstance('name'); <span class="codeComment">// assume filter on name column</span>

    <span class="codeComment">// get Angular instance from the ag-Grid instance</span>
    let ng2FilterInstance = agGridFilter.getFrameworkComponentInstance();

    <span class="codeComment">// now we're sucking diesel!!!</span>
    ng2FilterInstance.myMethod();
}</pre>
    </p>

    <h3 id="example-filtering-using-angular-components"><img src="../images/angular2_large.png" style="width: 20px;"/> Example: Filtering using Angular Components</h3>
    <p>
        Using Angular Components as a partial text Filter in the "Filter Component" column, illustrating filtering and lifecycle events.
    </p>
<show-complex-example example="../framework-examples/angular-examples/index.html?fromDocs=true&example=filter"
                      sources="{
                            [
                                { root: '/framework-examples/angular-examples/app/filter-component-example/', files: 'filter.component.ts,filter.component.html,partial-match-filter.component.ts' },
                                { root: '/framework-examples/angular-examples/app/', files: 'app.module.ts' }
                            ]
                          }"
                      plunker="https://embed.plnkr.co/ePKaio/"
                      exampleHeight="525px">
</show-complex-example>
