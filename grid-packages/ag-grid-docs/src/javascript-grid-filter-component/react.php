<h2>React Filtering</h2>

<p>
    It is possible to provide React filters for ag-Grid to use if you are are using the
    React version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
    registering framework components</a> for how to register framework components.
</p>

<h3 id="react-props"> React Props</h3>

<p>
    The React component will get the 'filter params' as described above as React Props.
    Therefore you can access all the parameters as React Props.
</p>

<?= createSnippet(<<<SNIPPET
// React filter Component
class NameFilter extends React.Component {
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
}
SNIPPET
, 'ts') ?>

<h3 id="react-methods-lifecycle">React Methods / Lifecycle </h3>

<p>
    All of the methods in the <code>IFilterComp</code> interface described above are applicable
    to the React Component with the following exceptions:
</p>
<ul class="content">
    <li><code>init()</code> is not used. Instead use the React props passed to your Component.</li>
    <li><code>destroy()</code> is not used. Instead use the React <code>componentWillUnmount()</code> method for
        any cleanup you need to do.
    </li>
    <li><code>getGui()</code> is not used. Instead use normal React magic in your <code>render()</code> method.</li>
</ul>

<p>
    After that, all the other methods (<code>onNewRowsLoaded()</code>, <code>getModel()</code>, <code>setModel()</code> etc.) behave the
    same, so put them directly onto your React Component.
</p>

<h3>React Hooks</h3>

<p>Please see <a href="../react-hooks/#hooks-with-methods">here</a> for information on using Hooks with Filter Components.</p>

<h3 id="accessing-the-react-component-instance">Accessing the React Component Instance</h3>

<p>
    ag-Grid allows you to get a reference to the filter instances via <code>api.getFilterInstance(colKey, callback)</code>.
    React components are created asynchronously, so it is necessary to use a callback rather than relying on the
    return value of this method. If your component is a React component, this will give you a reference to ag-Grid's
    component which wraps your React component, just like Russian Dolls. To get to the wrapped React instance
    of your component, use the <code>getFrameworkComponentInstance()</code> method as follows:
</p>

<?= createSnippet(<<<SNIPPET
// let's assume a React component as follows
class NameFilter extends React.Component {
    ... // standard filter methods hidden

    // put a custom method on the filter
    myMethod() {
        // does something
    }
}

// later in your app, if you want to execute myMethod()...
laterOnInYourApplicationSomewhere() {
    // get reference to the ag-Grid Filter component on name column
    api.getFilterInstance('name', agGridFilterInstance => {
        // get React instance from the ag-Grid instance
        var reactFilterInstance = agGridFilterInstance.getFrameworkComponentInstance();

        // now we're sucking diesel!!!
        reactFilterInstance.myMethod();
    });
}
SNIPPET
, 'ts') ?>

<h3 id="example-filtering-using-react-components"> Example: Filtering using React Components</h3>

<p>
    Using React Components as a partial text filter in the Name column, illustrating filtering and lifecycle events.
</p>

<?= grid_example('React Filter Component', 'filter-component', 'generated', ['enterprise' => false, 'exampleHeight' => 445, 'onlyShow' => 'react', 'extras' => ['bootstrap'], 'reactFunctional'=>true]) ?>

<h3>React Hook Filter Components</h3>

<p>Note that in this example we make use of <code>useImperativeHandle</code> for lifecycle methods - please see <a
            href="https://www.ag-grid.com/react-hooks/">here</a> for more information.</p>

<?= grid_example('React Filter Component', 'filter-component', 'generated', ['enterprise' => false, 'exampleHeight' => 445, 'onlyShow' => 'reactFunctional', 'extras' => ['bootstrap'], 'reactFunctional'=>true]) ?>
