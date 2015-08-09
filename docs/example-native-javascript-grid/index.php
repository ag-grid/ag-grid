<?php
$key = "Native Javascript";
$pageTitle = "HTML 5 Grid without Angular JS";
$pageDescription = "How to use Angular Grid to create an HTML 5 grid without using AngularJS";
$pageKeyboards = "HTML 5 Javascript grid without AngularJS";
include '../documentation_header.php';
?>

<div>

    <h2>Native Javascript</h2>

    <p>
        It is possible to not use AngularJS and still use Angular Grid. This is because Angular Grid
        uses AngularJS as an optional part of the rendering process, only when you want to
        use AngularJS for your custom rendering.
    </p>

    <p>
        To use Angular Grid outside of AngularJS, reference the Angular Grid javascript file as normal.
        Then use the global angularGrid function to initialise an instance of the grid.
    </p>

    <pre>angularGrid(cssSelectorForDiv, gridOptions);</pre>

    <p>
        Where:<br>
        <b>cssSelectorForDiv:</b> The CSS selector for the div to contain the grid.<br>
        <b>gridOptions:</b> The grid options to pass to the grid.<br>
    </p>

    <p>
        All of the grid features are fully supported in this mode with the following three <i>gridOptions</i> exceptions:<br/>
        <b>angularCompileRows</b>: AngularJS compiling of rows is not supported.<br>
        <b>angularCompileFilters</b>: AngularJS compiling of custom filters is not supported.<br>
        <b>angularCompileHeaders</b>: AngularJS compiling of custom headers is not supported.<br>
    </p>

    <p>
        If you are not an AngularJS developer and are afraid of what the above means, it means you won't be able
        to do things only AngularJS developers would want to do. In other words, you will not be restricted in any
        way if you are not using AngularJS.
    </p>

    <h4>Basic Example</h4>

    Below is the 'getting started' example from the documentation, rewritten to not use AngularJS.

    <show-example example="example1" example-height="160px"></show-example>

    <h4>Complex Example</h4>

    <p>
        Below is the example from the main page. This demonstrates a lot of the features inside Angular Grid.
        For how individual features work, please refer to the main documentation. However the differences
        between this and using Angular Grid inside AngularJS are as follows:
    </p>

    <ul>
        <li>
            AngularJS script is not loaded.
        </li>
        <li>
            The div has an ID, instead of using the ag-grid attribute.
        </li>
        <li>
            The angularGrid method is called, passing in the ID of the div to use for the table and the grid options.
        </li>
    </ul>

    <show-example example="html5grid"></show-example>

</div>

<?php include '../documentation_footer.php';?>
