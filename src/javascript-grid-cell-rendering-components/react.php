<!-- React from here on -->
<h2 id="reactCellRendering">
    <img src="../images/react_large.png" style="width: 60px;"/>
    React Cell Rendering
</h2>

<div class="note" style="margin-bottom: 20px">
    <img align="left" src="../images/note.png" style="margin-right: 10px;" />
    <p>This section explains how to utilise ag-Grid cellRenders using React. You should read about how
    <a href="/">Cell Rendering works in ag-Grid</a> first before trying to
    understand this section.</p>
</div>

<p>
    It is possible to provide a React cell renderer for ag-Grid to use. All of the information above is
    relevant to React cell renderer's. This section explains how to apply this logic to your React component.
</p>

<p>
    For examples on React cellRendering, see the
    <a href="https://github.com/ag-grid/ag-grid-react-example">ag-grid-react-example</a> on Github.
    In the example, both 'Skills' and 'Proficiency' columns use React cell renderer's. The Country column
    uses a standard ag-Grid cell renderer, to demonstrate both working side by side.</p>
</p>

<h3 id="specifying-a-react-cell-renderer"><img src="../images/react_large.png" style="width: 20px;"/> Specifying a React Cell Renderer</h3>

<p>
    If you are using the ag-grid-react component to create the ag-Grid instance,
    then you will have the option of additionally specifying the cell renderer's
    as React components.
</p>

<pre><span class="codeComment">// create your cell renderer as a React component</span>
class NameCellRenderer extends React.Component {
    render() {
    <span class="codeComment">// put in render logic</span>
        return &lt;span>{this.props.value}&lt;/span>;
    }
}

<span class="codeComment">// then reference the Component in your colDef like this</span>
colDef = {

    <span class="codeComment">// instead of cellRenderer we use cellRendererFramework</span>
    cellRendererFramework: NameCellRenderer

    <span class="codeComment">// specify all the other fields as normal</span>
    headerName: 'Name',
    field: 'firstName',
    ...
}</pre>

<p>
    By using <code>colDef.cellRendererFramework</code> (instead of <code>colDef.cellRenderer</code>) the grid
    will know it's a React component, based on the fact that you are using the React version of
    ag-Grid.
</p>

<p>
    This same mechanism can be to use a React Component in the following locations:
<ul>
    <li>colDef.cellRenderer<b>Framework</b></li>
    <li>colDef.floatingCellRenderer<b>Framework</b></li>
    <li>gridOptions.fullWidthCellRenderer<b>Framework</b></li>
    <li>gridOptions.groupRowRenderer<b>Framework</b></li>
    <li>gridOptions.groupRowInnerRenderer<b>Framework</b></li>
</ul>
In other words, wherever you specify a normal cell renderer, you can now specify a React cell renderer
in the property of the same name excepting ending 'Framework'. As long as you are using the React ag-Grid component,
the grid will know the framework to use is React.
</p>

<h3 id="example-rendering-using-react-components">Example: Rendering using React Components</h3>
<p>
    Using React Components in the Cell Renderer's
</p>

<show-complex-example example="../framework-examples/react-examples/examples/?fromDocs&example=dynamic"
                      sources="{
                            [
                                { root: '/framework-examples/react-examples/examples/src/dynamicComponentExample/', files: 'ChildMessageRenderer.jsx,CurrencyRenderer.jsx,ParamsRenderer.jsx,CubeRenderer.jsx,DynamicComponentsExample.jsx,SquareRenderer.jsx' }
                            ]
                          }"
                      exampleHeight="525px">
</show-complex-example>



<h3 id="react-props"><img src="../images/react_large.png" style="width: 20px;"/> React Props</h3>

<p>
    The React component will get the 'Cell Renderer Params' as described above as its React Props.
    Therefore you can access all the parameters as React Props.

<pre><span class="codeComment">// React Cell Renderer Component</span>
class NameCellRenderer extends React.Component {

    <span class="codeComment">// did you know that React passes props to your component constructor??</span>
    constructor(props) {
        super(props);
        <span class="codeComment">// from here you can access any of the props!</span>
        console.log('The value is ' + props.value);
        <span class="codeComment">// we can even call grid API functions, if that was useful</span>
        props.api.selectAll();
    }

    render() {
        <span class="codeComment">// or access props using 'this'</span>
        return &lt;span>{this.props.value}&lt;/span>;
    }
}</pre>
</p>

<h3 id="react-methods-lifecycle"><img src="../images/react_large.png" style="width: 20px;"/> React Methods / Lifecycle</h3>

<p>
    All of the methods in the ICellRenderer interface described above are applicable
    to the React Component with the following exceptions:
<ul>
    <li><i>init()</i> is not used. Instead use the React props passed to your Component.</li>
    <li><i>destroy()</i> is not used. Instead use the React <i>componentWillUnmount()</i> method for
        any cleanup you need to do.</li>
    <li><i>getGui()</i> is not used. Instead do normal React magic in your <i>render()</i> method..</li>
</ul>

<h3 id="handling-refresh"><img src="../images/react_large.png" style="width: 20px;"/> Handling Refresh</h3>

<p>
    You have the option of handling refresh or not by either providing a <i>refresh()</i> method on
    your React component or not. If not present, then the grid will destroy your component and create
    a new one if it tries to refresh the cell. If you do implement it, then it's up to your React
    components <i>refresh()</i> method to update the state of your component.
</p>

<h3 id="example-rendering-using-more-complex-react-components">Example: Rendering using more complex React
    Components</h3>
<p>
    Using more complex React Components in the Cell Renderer's
</p>

<show-complex-example example="../framework-examples/react-examples/examples/?fromDocs&example=rich-dynamic"
                      sources="{
                            [
                                { root: '/framework-examples/react-examples/examples/src/richComponentExample/', files: 'ClickableRenderer.jsx,RatioRenderer.jsx,RichComponentsExample.jsx' }
                            ]
                          }"
                      exampleHeight="525px">
</show-complex-example>
