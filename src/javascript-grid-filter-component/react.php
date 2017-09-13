   <h2 id="reactFiltering">
        <img src="../images/react.png" style="width: 60px"/>
        React Filtering
    </h2>

    <div class="note" style="margin-bottom: 20px">
        <img align="left" src="../images/note.png" style="margin-right: 10px;" />
        <p>This section explains how to create an ag-Grid Filter using React. You should read about how
            <a href="../javascript-grid-filter-component/">Filters Components</a> work in ag-Grid first before trying to
            understand this section.</p>
    </div>

    <p>
        It is possible to provide a React filter for ag-Grid to use. All of the information above is
        relevant to React filters. This section explains how to apply this logic to your React component.
    </p>

    <p>
        For examples on React filtering, see the
        <a href="https://github.com/ag-grid/ag-grid-react-example">ag-grid-react-example</a> on Github.
        In the example, 'Skills' , 'DOB' and 'Proficiency' columns use React filters.</p>
    </p>

    <h3 id="specifying-a-react-filter"><img src="../images/react_large.png" style="width: 20px;"/> Specifying a React Filter</h3>

    <p>
        If you are using the ag-grid-react component to create the ag-Grid instance,
        then you will have the option of additionally specifying the filters
        as React components.
    </p>

    <snippet>
// create your filter as a React component
class NameFilter extends React.Component {

    // put in render logic, build a nice gui in React
    render() {
        return &lt;span&gt;My Nice Little Filter Gui&lt;/span&gt;;
    }

    // implement the other Filter callbacks
    isFilterActive(params) {
        // do some filter logic
        return filterPass ? true : false;
    }

    // etc etc, more logic, but leaving out for now
}

// then reference the Component in your colDef like this
colDef = {

    // instead of cellRenderer we use cellRendererFramework
    filterFramework: NameFilter

    // specify all the other fields as normal
    headerName: 'Name',
    field: 'firstName',
    ...
}</snippet>

    <p>
        By using <i>colDef.filterFramework</i> (instead of <i>colDef.filter</i>) the grid
        will know it's a React component, based on the fact that you are using the React version of
        ag-Grid.
    </p>


    <h3 id="react-props"><img src="../images/react_large.png" style="width: 20px;"/> React Props</h3>

    <p>
        The React component will get the 'filter Params' as described above as its React Props.
        Therefore you can access all the parameters as React Props.

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
    </p>

    <h3 id="react-methods-lifecycle"><img src="../images/react_large.png" style="width: 20px;"/> React Methods / Lifecycle</h3>

    <p>
        All of the methods in the IFilter interface described above are applicable
        to the React Component with the following exceptions:
    <ul>
        <li><i>init()</i> is not used. Instead use the React props passed to your Component.</li>
        <li><i>destroy()</i> is not used. Instead use the React <i>componentWillUnmount()</i> method for
            any cleanup you need to do.</li>
        <li><i>getGui()</i> is not used. Instead do normal React magic in your <i>render()</i> method..</li>
    </ul>

    <p>
        After that, all the other methods (<i>onNewRowsLoaded(), getModel(), setModel()</i> etc) behave the
        same so put them directly onto your React Component.
    </p>

    <h3 id="accessing-the-react-component-instance"><img src="../images/react_large.png" style="width: 20px;"/> Accessing the React Component Instance</h3>

    <p>
        ag-Grid allows you to get a reference to the filter instances via the <i>api.getFilterInstance(colKey)</i>
        method. If your component is a React component, then this will give you a reference to the ag-Grid's
        Component which wraps your React Component. Just like Russian Dolls. To get to the wrapped React instance
        of your component, use the <i>getFrameworkComponentInstance()</i> method as follows:
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

   <h3 id="example-filtering-using-react-components"><img src="../images/react_large.png" style="width: 20px;"/> Example: Filtering using React Components</h3>
   <p>
       Using React Components as a partial text Filter in the "Filter Component" column, illustrating filtering and lifecycle events.
   </p>

   <?= example('Filter Component', 'react-filter', 'react', array( "exampleHeight" => 440, "showResult" => true )); ?>
