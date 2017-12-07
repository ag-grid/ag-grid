<!-- React from here on -->
<h2 id="reactCellRendering">
    <img src="../images/react_large.png" style="width: 60px;"/>
    React Cell Rendering
</h2>

<p>
    It is possible to provide a React cell renderer's for ag-Grid to use if you are are using the
    React version of ag-Grid.
</p>

<h3 id="example-rendering-using-react-components">Example: Rendering using React Components</h3>
<p>
    Using React Components in the Cell Renderer's
</p>

<?= example('Simple Dynamic Component', 'dynamic-components', 'generated', array('enterprise' => false, 'onlyShow' => 'react', 'extras' => array('fontawesome', "bootstrap"))) ?>

<h3 id="react-props"><img src="../images/react_large.png" style="width: 20px;"/> React Props</h3>

<p>
    The React component will get the 'Cell Renderer Params' as described above as its React Props.
    Therefore you can access all the parameters as React Props.

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
</p>

<h3 id="react-methods-lifecycle"><img src="../images/react_large.png" style="width: 20px;"/> React Methods / Lifecycle</h3>

<p>
    All of the methods in the <code>ICellRenderer</code> interface described above are applicable
    to the React Component with the following exceptions:
<ul>
    <li><i>init()</i> is not used. Instead use the React props passed to your Component.</li>
    <li><i>destroy()</i> is not used. Instead use the React <i>componentWillUnmount()</i> method for
        any cleanup you need to do.</li>
    <li><i>getGui()</i> is not used. Instead do normal React magic in your <i>render()</i> method..</li>
</ul>

<h3 id="handling-refresh"><img src="../images/react_large.png" style="width: 20px;"/> Handling Refresh</h3>

<p>
    To handle refresh, implement logic inside the <code>refresh()</code> method inside your component and return true.
    If you do not want to handle refresh, just return false from the refresh method (which will tell the grid you do
    not handle refresh and your component will be destroyed and recreated if the underlying data changes).
</p>

