<?php
$key = "Callbacks";
$pageTitle = "ag-Grid Callbacks";
$pageDescription = "Learn how each callbacks impacts ag-Grid.";
$pageKeyboards = "javascript data grid ag-Grid Callbacks";
include '../documentation_header.php';
?>

<div>

    <h2>Callbacks</h2>

    <p>
        Callbacks are used by the grid for contacting your client application and asking it questions.
        It is not intended to inform your application of anything.
    <p>

    <h4>
        <img src="/images/javascript.png" height="20"/>
        <img src="/images/angularjs.png" height="20px"/>
        Javascript and AngularJS 1.x
    </h4>
    <p>
        Add callbacks to the gridOptions.
    </p>

    <h4>
        <img src="/images/angular2.png" height="20px"/>
        AngularJS 2
    </h4>
    <p>
        Add callbacks to the gridOptions or set as AngularJS properties.
    </p>

    <h4>
        <img src="/images/webComponents.png" height="20px"/>
        Web Components
    </h4>
    <p>
        Add callbacks to the gridOptions or set as AngularJS properties.
    </p>

    <h2>List of Callbacks</h2>

    <table class="table">
        <tr>
            <th>Attribute</th>
            <th>Description</th>
        </tr>

        <tr>
            <th>isExternalFilterPresent()</th>
            <td>Grid calls this method to know if external filter is present.</td>
        </tr>
        <tr>
            <th>doesExternalFilterPass(node)</th>
            <td>Return true if external filter passes, otherwise false.</td>
        </tr>
        <tr>
            <th>getRowClass(params)</th>
            <td>Callback version of property 'rowClass'. Function should return a string or an array of strings.</td>
        </tr>
        <tr>
            <th>getRowStyle(params)</th>
            <td>Callback version of property 'rowStyle'. Function should return an object of CSS values.</td>
        </tr>
        <tr>
            <th>headerCellRenderer(params)</th>
            <td>Provide a function for custom header rendering.</td>
        </tr>
        <tr>
            <th>groupRowInnerRenderer(params)<br/> groupAggFunction(params)<br/> groupRowRenderer(params)</th>
            <td>Callbacks for grouping. See the section on grouping for details explanation.</td>
        </tr>
        <tr>
            <th>isScrollLag()</th>
            <td>By default, scrolling lag is enabled for Safari and Internet Explorer (to solve scrolling performance
                issues in these browsers). To override when to use scroll lag either a) set suppressScrollLag to
                true to turn off scroll lag feature or b) return true of false from the function
                isScrollLag. This is a function, as it's expected your code will check the environment to decide
                whether to use scroll lag or not.</td>
        </tr>
        <tr>
            <th>getBusinessKeyForNode(node)</th>
            <td>Return a business key for the node. If implemented, then each row in the dom will have an attribute
                <i>row-id='abc'</i> where abc is what you return as the business key. This is useful for automated
            testing, as it provides a way for your tool to identify rules based on unique business keys.</td>
        </tr>


    </table>

</div>

<?php include '../documentation_footer.php';?>
