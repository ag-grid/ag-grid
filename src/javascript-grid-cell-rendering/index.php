<?php
$key = "Cell Rendering";
$pageTitle = "ag-Grid Cell Rendering";
$pageDescription = "Out of the box grid rendering components and how to configure them.";
$pageKeyboards = "ag-Grid Rendering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="first-h1" id="cell-editors">Cell Rendering</h1>

<p>
    By default, the grid will place the values of your data into the cells as simple strings.
    If you want something other than simple strings, then you use a cell renderer.
    So for rendering your values, you have the following three options:
    <ol>
        <li>Do nothing, simple strings get used to display the data.</li>
        <li>Use one of the grid provided cell renderer's.</li>
        <li>Build your own cell renderer.</li>
    </ol>

<snippet>
// 1 - do nothing, simple text is used by the grid
var colDef1 = {
    cellRenderer: null,
    ...
}

// 2 - use one of the grids provided cell renderer's, reference it by name
var colDef2 = {
    cellRenderer:'agGroupCellRenderer',
    ...
}

// 3 - provide your own cell renderer
var colDef3 = {
    cellRenderer: MyCustomCellRendererClass,
    ...
}</snippet>

    This section of the documentation explains the first two items above, how to use no cell
    renderer and how to use the grid provided cell renderer's. To build your own cell renderer,
    see the section <a href="../javascript-grid-cell-rendering-components/">Cell Rendering Components</a>.
</p>

<p>
    This section of the documentation also lists how to use all the grids provided renderer's.
</p>

<h2>Cell Rendering Flow</h2>

<p>
    The diagram below (which is taken from the section <a href="../javascript-grid-value-getters/">Value Getters & Formatters</a>)
    summarises the steps the grid takes while working out what to render and how to render.
</p>

<p>
    In short, a value is prepared. The value comes using either the <code>colDef.field</code> or the
    <code>colDef.valueGetter</code>. The value is also optionally passed through a <code>colDef.valueFormatter</code>
    if it exists. Then the value is finally placed into the DOM, either directly, or by using the chosen
    <code>colDef.cellRenderer</code>.
</p>

<img src="../javascript-grid-value-getters/valueGetterFlow.svg"/>

<h2>Choosing No Cell Renderer</h2>

<p>
    If you have no requirements for custom cells, then you should use no cell renderer.
    Having no custom cell renderer's will result in the fastest possible grid (which might
    be important to you if using Internet Explorer) as even the simplest cell renderer
    will result in some extra div's in the DOM.
</p>

<p>
    If you just want to do simple formatting of the data (eg currency or date formatting)
    then you can use <code>colDef.valueFormatter</code>.
</p>

<h2>Grid Provided Renderer's</h2>

<p>
    The grid comes with three built in renderer's which are:
    <ul>
        <li><b>group</b>: For displaying group values with expand / collapse functionality.</li>
        <li><b>animateShowChange</b> and <b>animateSlide</b>: For animating changes in data.</li>
    </ul>
    The following sections goes through each one in detail.
</p>

<h2 id="animate-renderer">Grid Renderer's - animateShowChange and animateSlide</h2>

<p>
    The grid provides two cell renderer's for animating changes to data. They are:
<ul>
    <li>
        <b>animateShowChange:</b> The previous value is temporarily shown beside the old value
        with a directional arrow showing increase or decrease in value. The old value is then faded out.
    </li>
    <li>
        <b>animateSlide:</b> The previous value shown in a faded fashion and slides, giving a ghosting effect
        as the old value fades adn slides away.
    </li>
</ul>
</p>

<p>
    The example below shows both types of animation cell renders in action. To test, try the following:
<ul>
    <li>
        Columns A, B and C are editable.
    </li>
    <li>
        Columns D and E are updated via clicking the button.
    </li>
    <li>
        Changes to any of the first 5 columns results in animations in the Total and Average column.
    </li>
    <li>
        Changes to D and E also result in animations.
    </li>
</ul>
</p>

<?= example('Animation Renderers', 'animation-renderers', 'generated') ?>

<note>
    We hope you like the animation cell renderer's. However you can also take inspiration from them,
    and create your own animations in your own cell renderer's. Check out our source code on Github on
    how we implemented these cell renderer's for inspiration.
</note>

<note>
    Most of the ag-Grid users love the <code>animateShowChange</code> cell renderer for showing changes in values.
    Not many people like the animateSlide one. So if you are trying to impress someone, probably best
    show them the <code>animateShowChange</code> :)
</note>

<h2>Grid Renderer - Group</h2>

<p>
    If you are grouping in the grid, then you will need to provide a group cell renderer
    as the group cell renderer is what provides the user with the expand and collapse functionality.
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
        suppressCount: false, // turn off the row count
        checkbox: true, // enable checkbox selection
        padding: 10, // set padding to 10px
        innerRenderer: myInnerRenderer, // provide an inner renderer
        footerValueGetter: myFooterValueGetter // provide a footer value getter
    }
    ...
};</snippet>

<p>
    The set of parameters for the group cell renderer are:
<ul>
    <li><b>suppressCount:</b> One of [true, false], if true, count is not displayed beside the name.</li>
    <li><b>checkbox:</b> One of [true,false], if true, a selection checkbox is included.</li>
    <li><b>padding:</b> A positive number. The amount of padding, in pixels, to indent each group.</li>
    <li><b>suppressPadding:</b> Set to true to node including any padding (indentation) in the child rows.</li>
    <li><b>innerRenderer:</b> The renderer to use for inside the cell (after grouping functions are added).</li>
    <li><b>footerValueGetter:</b> The value getter for the footer text. Can be a function or expression.</li>
</ul>
</p>

<h3>Example Group cellRenderer</h3>

<p>
    Below shows an example of configuring a group cell renderer. The example setup is not realistic as it
    has many columns configured for the showing the groups. The reason for this is to demonstrate different
    group column configurations side by side. In your application, you will typically have one column
    for showing the groups.
</p>

<p>
    The example is built up as follows:
    <ul>
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
            <ul>
                <li><code>suppressCount=true</code>: Suppresses the row count.</li>
                <li><code>checkbox=true</code>: Adds a selection checkbox.</li>
                <li><code>padding=20</code>: Changes the padding (indentation) of the levels.</li>
                <li><code>innerRenderer=SimpleCellRenderer</code>: Puts custom rendering for displaying the value.
                The group cellRenderer will take care of all the expand / collapse, selection etc, but then allow
                you to customise the display of the value. In this example we add a border when the value is a group,
                and we add the Ireland
                <img src="https://flags.fmcdn.net/data/flags/mini/ie.png" style="width: 20px; position: relative; top: -2px;"/>
                flag (because Niall Crosby is from Ireland) to the leaf levels.</li>
            </ul>
        </li>
    </ul>
</p>

<?= example('Group Renderers', 'group-renderer', 'generated', array("enterprise" => 1)) ?>

<note>
    If you don't like the grid provided group cell renderer, you can build your own cell renderer and provide
    the grouping functionality. If you do this, then take a look at the grids source code and see how we
    implemented the ag-Grid group cell renderer.
</note>

<?php include '../documentation-main/documentation_footer.php';?>
