<?php
$pageTitle = "ag-Grid Group Cell Renderer";
$pageDescription = "Group cell renderer is for rendering group data in a column.";
$pageKeywords = "JavaScript grid grouping";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

    <h1>Group Cell Renderer</h1>

    <p class="lead">
        If you are grouping in the grid, then you will need to provide a group cell renderer
        as the group cell renderer is what provides the user with the expand and collapse functionality.
    </p>

    <p>
        The key for the group cell renderer is <code>agGroupCellRenderer</code>.
    </p>

    <p>
        The grid's group cell renderer takes many parameters to configure it. Here is an example
        of a column and it's configuration:
    </p>

    <snippet>
colDef = {
    // tell the grid we want to show group values in this column
    showRowGroup: true,
    // set the cell renderer to 'group'
    cellRenderer:'agGroupCellRenderer',
    // provide extra params to the cellRenderer
    cellRendererParams: {
        suppressCount: true, // turn off the row count
        suppressDoubleClickExpand: true, // turn off double click for expand
        checkbox: true, // enable checkbox selection
        innerRenderer: myInnerRenderer, // provide an inner renderer
        footerValueGetter: myFooterValueGetter // provide a footer value getter
    }
    ...
};</snippet>

    <p> The set of parameters for the group cell renderer are: </p>

    <ul class="content">
        <li><b>suppressCount:</b> One of [true, false], if true, count is not displayed beside the name.</li>
        <li><b>checkbox:</b> One of [true,false], if true, a selection checkbox is included.</li>
        <li><b>suppressPadding:</b> Set to true to node including any padding (indentation) in the child rows.</li>
        <li><b>suppressDoubleClickExpand:</b> Set to true to suppress expand on double click.</li>
        <li><b>suppressEnterExpand:</b> Set to true to to suppress expand on Enter key.</li>
        <li><b>innerRenderer:</b> The renderer to use for inside the cell (after grouping functions are added).</li>
        <li><b>footerValueGetter:</b> The value getter for the footer text. Can be a function or expression.</li>
        <li><b>suppressDoubleClickExpand:</b> If true then double clicking will not expand the group.</li>
    </ul>

    <h3>Example Group cellRenderer</h3>

    <p>
        Below shows an example of configuring a group cell renderer. The example setup is not realistic as it
        has many columns configured for the showing the groups. The reason for this is to demonstrate different
        group column configurations side by side. In your application, you will typically have one column
        for showing the groups.
    </p>

    <p>
        The example is built up as follows:
    </p>
    <ul class="content">
        <li>
            The data is grouped by two columns: <b>Type</b> (one of 'Fiction' or 'Non-Fiction') and <b>Country</b>
            (a country name, eg Ireland or United Kingdom).
        </li>
        <li>
            The column <b>'Country Group - No Renderer'</b> configures the grid to put the 'Country' group data
            only into this column by setting <code>showRowGroup='country'</code>. All rows that are not this
            group are blank. There is no cell renderer configured, so the grid just places the text for the group
            into the cell, there is not expand / collapse functionality.
        </li>
        <li>
            The column <b>'All Groups - no Renderer'</b> builds on before, but adds all groups by setting
            <code>showRowGroup=true</code>. This gets the column to display all groups, but again no cell renderer
            so not expand / collapse functionality.
        </li>
        <li>
            The column <b>Group Renderer A</b> builds on before, but adds the group cell renderer with
            <code>cellRenderer='group'</code>. The values are exactly as per the previous column, except now
            we have expand and collapse functionality.
        </li>
        <li>
            The column <b>Group Renderer B</b> builds on before, but adds <code>field=city</code> so that
            the city is displayed in the leave nodes in the group column.
        </li>
        <li>
            The column <b>Group Renderer C</b> builds on before, but adds the following <code>cellRendererParams</code>:
            <ul class="content">
                <li><code>suppressCount=true</code>: Suppresses the row count.</li>
                <li><code>suppressDoubleClickExpand=true</code>: Suppress double click for expanding.</li>
                <li><code>checkbox=true</code>: Adds a selection checkbox.</li>
                <li><code>innerRenderer=SimpleCellRenderer</code>: Puts custom rendering for displaying the value.
                    The group cellRenderer will take care of all the expand / collapse, selection etc, but then allow
                    you to customise the display of the value. In this example we add a border when the value is a group,
                    and we add the Ireland
                    <img src="https://flags.fmcdn.net/data/flags/mini/ie.png" style="width: 20px; position: relative; top: -2px;" alt="Ireland" />
                    flag (because Niall Crosby is from Ireland) to the leaf levels.</li>
            </ul>
        </li>
    </ul>

<?= grid_example('Group Renderers', 'group-renderer', 'generated', ['enterprise' => true]) ?>


<?php include '../documentation-main/documentation_footer.php';?>
