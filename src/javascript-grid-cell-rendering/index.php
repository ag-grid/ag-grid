<?php
$pageTitle = "Cell Rendering: Styling & Appearance Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Cell Rendering. Use Cell Rendering to have cells rendering values other than simple strings. For example, put country flags beside country names, or push buttons for actions. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Rendering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Cell Rendering</h1>

<p>
    By default the grid renders values into the cells as strings.
    If you want something more complex you use a cell renderer.
</p>

<p>
    The cell editor for a column is set via <code>colDef.cellRenderer</code> and can
    be any of the following types:
    <ol class="content">
        <li><code>undefined / null</code>: Grid renders the value as a string.</li>
        <li><code>String</code>: The name of a cell renderer registered with the grid.</li>
        <li><code>Class</code>: Provide your own cell renderer component directly without registering.</li>
        <li><code>Function</code>: A function that returns either an HTML string or DOM element for display.</li>
    </ol>
    The code snippet below demonstrates each of these method types.
</p>

<snippet>
// 1 - undefined / null - Grid renders the value as a string.
var colDef1 = {
    cellRenderer: null,
    ...
}

// 2 - String - The name of a cell renderer registered with the grid.
var colDef2 = {
    cellRenderer: 'agGroupCellRenderer',
    ...
}

// 3 - Class - Provide your own cell renderer component directly without registering.
var colDef3 = {
    cellRenderer: MyCustomCellRendererClass,
    ...
}

// 4 - Function - A function that returns an HTML string or DOM element for display
var colDef3 = function(params) {
    // put the value in bold
    return 'Value is &lt;b>'+params.value+'&lt;/b>';
}

</snippet>

<p>
    This remainder of this documentation page goes through the grid provided cell renderer's.
    To build your own cell renderer see the section
    <a href="../javascript-grid-cell-rendering-components/">Cell Rendering Components</a>.
</p>

<h2>No Cell Renderer</h2>

<p>
    If you have no requirements for custom cells, then you should use no cell renderer.
    Having no custom cell renderers will result in the fastest possible grid (which might
    be important to you if using Internet Explorer) as even the simplest cell renderer
    will result in some extra div's in the DOM.
</p>

<p>
    If you just want to do simple formatting of the data (eg currency or date formatting)
    then you can use <code>colDef.valueFormatter</code>.
</p>

<h2>Many Renderers One Column</h2>

<p>It is also possible to use different renderers for different rows in the same column.
    Typically an application might check the rows contents and choose a renderer accordingly.
    To configure this set <code>colDef.cellRendererSelector</code>
    to a function that returns the name of the component to be used as a renderer and optionally
    the custom params to be passed into it<p>

<p>The parameters that this functions will receive the same parameters than a renderer would receive:<p>

<p>The following example illustrates how to use different renderers and parameters in the same column. Note that:</p>

<ul class="content">
    <li>The column 'Value' holds data of different types as shown in the column 'Type' (numbers/genders/moods).
    </li>
    <li><code>colDef.cellRendererSelector</code> is a function that selects the renderer based on the row data
    </li>
    <snippet>cellRendererSelector:function (params) {
            var moodDetails = {
                component: 'moodCellRenderer'
            };

            var genderDetails = {
                component: 'genderCellRenderer',
                params: {values: ['Male', 'Female']}
            };

            if (params.data.type === 'gender')
                return genderDetails;
            else if (params.data.type === 'mood')
                return moodDetails;
            else
                return null;

        }
</snippet>
    <li>
        The column 'Rendered Value' show the data rendered applying the component and params specified by <code>
            colDef.cellRendererSelector</code>
    </li>
</ul>

<?= example('Dynamic Rendering Component', 'dynamic-rendering-component', 'vanilla', array("enterprise" => 1, "exampleHeight" => 250)) ?>



<h2>Grid Provided Renderers</h2>

<p> The grid comes with three built-in renderers which are: </p>
    <ul class="content">
        <li><b>agGroupCellRenderer</b>: For displaying group values with expand / collapse functionality.</li>
        <li><b>agAnimateShowChangeCellRenderer</b> and <b>agAnimateSlideCellRenderer</b>: For animating changes in data.</li>
    </ul>

<p> The following sections goes through each one in detail.  </p>

<h2 id="animate-renderer">Grid Renderers - agAnimateShowChangeCellRenderer and agAnimateSlideCellRenderer</h2>

<p>
    The grid provides two cell renderers for animating changes to data. They are:
</p>

<ul class="content">
    <li>
        <code>agAnimateShowChangeCellRenderer:</code> The previous value is temporarily shown beside the old value
        with a directional arrow showing increase or decrease in value. The old value is then faded out.
    </li>
    <li>
        <code>agAnimateSlideCellRenderer:</code> The previous value shown in a faded fashion and slides, giving a ghosting effect
        as the old value fades adn slides away.
    </li>
</ul>

<p> The example below shows both types of animation cell renders in action. To test, try the following:
</p>
<ul class="content">
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

<?= example('Animation Renderers', 'animation-renderers', 'generated', array("processVue" => true)) ?>

<note>
    We hope you like the animation cell renderers. However you can also take inspiration from them,
    and create your own animations in your own cell renderers. Check out our source code on Github on
    how we implemented these cell renderers for inspiration.
</note>

<note>
    Most of the ag-Grid users love the <code>animateShowChange</code> cell renderer for showing changes in values.
    Not many people like the animateSlide one. So if you are trying to impress someone, probably best
    show them the <code>animateShowChange</code> :)
</note>

<h2>Grid Renderer - agGroupCellRenderer</h2>

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

<?= example('Group Renderers', 'group-renderer', 'generated', array("processVue" => true, "enterprise" => 1)) ?>

<note>
    If you don't like the grid provided group cell renderer, you can build your own cell renderer and provide
    the grouping functionality. If you do this, then take a look at the grid's source code and see how we
    implemented the ag-Grid group cell renderer.
</note>

<?php include '../documentation-main/documentation_footer.php';?>
