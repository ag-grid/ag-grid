<h2> React Filtering </h2>

<p>
    It is possible to provide React filters for ag-Grid to use if you are are using the
    React version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
    registering framework components</a> for how to register framework components.
</p>

<h3 id="react-props"> React Props</h3>

<p>
    The React component will get the 'filter Params' as described above as its React Props.
    Therefore you can access all the parameters as React Props.
</p>

    <snippet>
// React filter Component
class NameFilter extends React.Component {

    // did you know that React passes props to your component constructor??
    constructor(props) {
        super(props);
        // from here you can access any of the props!
        console.log('The field for this filter is ' + props.colDef.field);
    }

    // maybe your filter has a button in it, and when it gets clicked...
    onButtonWasPressed() {
        // all the methods in the props can be called
        this.props.filterChangedCallback();
    }
}</snippet>

<h3 id="react-methods-lifecycle">React Methods / Lifecycle </h3>

<p>
    All of the methods in the IFilter interface described above are applicable
    to the React Component with the following exceptions:
</p>
<ul class="content">
    <li><code>init()</code> is not used. Instead use the React props passed to your Component.</li>
    <li><code>destroy()</code> is not used. Instead use the React <code>componentWillUnmount()</code> method for
        any cleanup you need to do.
    </li>
    <li><code>getGui()</code> is not used. Instead do normal React magic in your <code>render()</code> method..</li>
</ul>

<p>
    After that, all the other methods (<code>onNewRowsLoaded(), getModel(), setModel()</code> etc) behave the
    same so put them directly onto your React Component.
</p>

<h3 id="accessing-the-react-component-instance"> Accessing
    the React Component Instance</h3>

<p>
    ag-Grid allows you to get a reference to the filter instances via the <code>api.getFilterInstance(colKey)</code>
    method. If your component is a React component, then this will give you a reference to the ag-Grid's
    Component which wraps your React Component. Just like Russian Dolls. To get to the wrapped React instance
    of your component, use the <code>getFrameworkComponentInstance()</code> method as follows:
</p>

    <snippet>
// lets assume a React component as follows
class NameFilter extends React.Component {

    ... // standard filter methods hidden

    // put a custom method on the filter
    myMethod() {
        // does something
    }
}

// then in your app, if you want to execute myMethod()...
laterOnInYourApplicationSomewhere() {

    // get reference to the ag-Grid Filter component
    var agGridFilter = api.getFilterInstance('name'); // assume filter on name column

    // get React instance from the ag-Grid instance
    var reactFilterInstance = agGridFilter.getFrameworkComponentInstance();

    // now we're sucking diesel!!!
    reactFilterInstance.myMethod();
}</snippet>

<h3 id="example-filtering-using-react-components"> Example:
    Filtering using React Components</h3>
<p>
    Using React Components as a partial text Filter in the "Filter Component" column, illustrating filtering and
    lifecycle events.
</p>

<?= example('React Filter Component', 'filter-component', 'generated', array('enterprise' => false, "exampleHeight" => 445, 'onlyShow' => 'react', 'extras' => array("bootstrap"))) ?>
