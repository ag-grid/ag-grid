<!-- React from here on -->
<h2> React Cell Rendering </h2>

<p>
    It is possible to provide React cell renderers for ag-Grid to use if you are are using the
    React version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
    registering framework components</a> for how to register framework components.
</p>

<h3 id="example-rendering-using-react-components">Example: Rendering using React Components</h3>

<p> Using React Components in the Cell Renderers </p>

<?= example('Simple Dynamic Component', 'dynamic-components', 'generated', array('enterprise' => false, 'onlyShow' => 'react', 'extras' => array('fontawesome', "bootstrap"))) ?>

<h3 id="react-props"> React Props</h3>

<p>
    The React component will get the 'Cell Renderer Params' as described above as its React Props.
    Therefore you can access all the parameters as React Props.
</p>

<snippet>
// React Cell Renderer Component
class NameCellRenderer extends React.Component {

    // did you know that React passes props to your component constructor??
    constructor(props) {
        super(props);
        // from here you can access any of the props!
        console.log('The value is ' + props.value);
        // we can even call grid API functions, if that was useful
        props.api.selectAll();
    }

    render() {
        // or access props using 'this'
        return &lt;span&gt;{this.props.value}&lt;/span&gt;;
    }
}</snippet>

<h3 id="react-methods-lifecycle"> React Methods / Lifecycle</h3>

<p>
    All of the methods in the <code>ICellRenderer</code> interface described above are applicable
    to the React Component with the following exceptions:
</p>

<ul class="content">
    <li><code>init()</code> is not used. Instead use the React props passed to your Component.</li>
    <li><code>destroy()</code> is not used. Instead use the React <code>componentWillUnmount()</code> method for
        any cleanup you need to do.</li>
    <li><code>getGui()</code> is not used. Instead do normal React magic in your <code>render()</code> method..</li>
</ul>

<h3> Handling Refresh</h3>

<p>
    To handle refresh, implement logic inside the <code>refresh()</code> method inside your component and return true.
    If you do not want to handle refresh, just return false from the refresh method (which will tell the grid you do
    not handle refresh and your component will be destroyed and recreated if the underlying data changes).
</p>

