<?php
$key = "Styling";
$pageTitle = "ag-Grid Styling";
$pageDescription = "ag-Grid Styling";
$pageKeyboards = "ag-Grid Styling";
$pageGroup = "themes";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="themes">
        <img src="../images/svg/docs/themes.svg" width="50" />
        Themes
    </h2>

    <p>
        ag-Grid is designed to have its look and feel derived from a theme.
    </p>

    <p>
        Out of the box, five themes are provided: ag-fresh, ag-blue, ag-dark, ag-material and ag-bootstrap.
    </p>
    <p>
        To use a theme, add the theme class name to the div element where the ag-Grid directive is attached.
    </p>
    <p>
        The following is an example of using the ag-fresh theme:<br/>
        <pre>&lt;div ag-grid="gridOptions" class="ag-fresh">&lt;/div></pre>
    </p>
    <p>
        The following is an example of using the ag-dark theme:<br/>
        <pre>&lt;div ag-grid="gridOptions" class="ag-dark">&lt;/div></pre>
    </p>

    <h2>When to Create a Theme</h2>

    <p>
        You have the following options when choosing a theme:
        <ol>
            <li>Use one of the provided themes eg <i>ag-fresh</i>.</li>
            <li>Use one of the provided themes and override particular items to fine tune it.</li>
            <li>Create your own theme from scratch. This is the most difficult and you are more
            exposed to breaking changes in ag-Grid releases.</li>
        </ol>
    </p>

    <p>
        You should only create your own theme when options 1 and 2 above don't suit, as it is
        the most difficult.
        If you do decide to create your own theme, then you can use one of the provided themes and
        use that as a template. They can be found on GitHub here:
        <a href="https://github.com/ag-grid/ag-grid/tree/master/src/styles">https://github.com/ceolter/ag-grid/tree/master/src/styles</a>
    </p>


    <p>
        This section does not provide an example of building a theme as a number of themes
        are already provided with ag-Grid - these can be used as a basis for any additional themes you may wish to create.
    </p>

    <h2 id="when-to-style-via-themes">When to Style via Themes</h2>

    <p>
        Themes are intended to change the overall look and feel of a grid. If you want to style a particular
        column, or a particular header, consider using either cell and header renderers, or applying css
        classes or styles at the column definition level.
    </p>

    <p>
        Sometimes it is possible to achieve the same effect using custom renderers as it is with themes.
        If so, use whichever one makes more sense for you, there isn't a hard and fast rule.
    </p>

    <h2 id="what-to-style-via-themes">What to Style via Themes</h2>

    Any of the CSS classes described below can have style associated with them.

    However you should be cautious about overriding style that is associated outside of the theme.

    For example, the ag-pinned-cols-viewport, has the following style:
    <pre>    .ag-pinned-cols-viewport {
        float: left;
        position: absolute;
        overflow: hidden;
    }</pre>

    The style attributes float, position and overflow are intrinsic to how the grid works. Changing
    these values will change how the grid operates. If unsure, take a look at the styles associated
    with an element using your browsers developer tools. If still unsure, try it out, see what
    result you get.

    <h2 id="structure-example">Structure Example</h2>

    <p>
        The exact structure of the DOM within ag-Grid is dependent on its configuration and what data is present.
        This page takes the below basic example grid, with one pinned column, as an example to demonstrate the DOM structure.
        The reader is encouraged to inspect the DOM (using your browsers developer tools) to dig deeper.
    </p>

    <show-example example="exampleStyling"></show-example>

    <h2 id="high-level-overview">High Level Overview</h2>

    <p>
        The diagram below shows the hierarchy of the core div elements which form the four quadrants
        of the table. The four quadrants are as follows:
    </p>

    <ul>
        <li><b>ag-pinned-header:</b> Contains the pinned header cells. This container does not scroll.</li>
        <li><b>ag-header-container:</b> Contains the non-pinned header cells. This container is within
            a viewport (<b>ag-header-viewport</b>) that scrolls horizontally to match the position of the ag-body-viewport. This
            container does not scroll vertically.</li>
        <li><b>ag-pinned-cols-container:</b> Contains the pinned rows. This container is within a
            viewport (<b>ag-pinned-cols-viewport</b>) that scrolls vertically to match the position of the ag-body-viewport. This
            container does not scroll horizontally.</li>
        <li><b>ag-body-container:</b> Contains the non-pinned rows. This container is within a
            viewport (<b>ag-body-viewport</b>) that scrolls both vertically and horizontally.</li>
    </ul>

    Note: Both the ag-header-viewport and ag-pinned-cols-viewport do not have scrollbars. They
    only scroll in response to changes to the ag-body-viewport.

    <p/>

    <b style="padding-left: 300px;">Core DIV Elements</b>
    <br/>
    <div class='inline' style="margin-left: 50px;">
        ag-root <br/>
        <!-- header -->
        <div class='block'>
            ag-header <br/>
            <div class='inline'>
                ag-pinned-header <br/>
                <img src="pinnedHeader.png"/>
            </div>
            <div class='inline'>
                ag-header-viewport <br/>
                <div class='inline'>
                    ag-header-container <br/>
                    <img src="header.png"/>
                </div>
            </div>
        </div>
        <!-- body -->
        <div class='block'>
            ag-body <br/>
            <div class='inline'>
                ag-pinned-cols-viewport <br/>
                <div class='inline'>
                    ag-pinned-cols-container <br/>
                    <img src="pinnedBody.png"/>
                </div>
            </div>
            <div class='inline'>
                ag-body-viewport-wrapper <br/>
                <div class='inline'>
                    ag-body-viewport <br/>
                    <div class='inline'>
                        ag-body-container <br/>
                        <img src="body.png"/>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <h2 id="detailed-breakdown">Detailed Breakdown</h2>

    Below gives a detailed breakdown of the DOM for the example. In the example, the following is highlighted:
    <p/>
    <ul>
        <li><span class="agClass">Classes:</span> These CSS classes can have style associated with them in a theme.</li>
        <li><span class="agAttr">Row & Col Attributes:</span> These attributes can be used to identify rows and columns using CSS selectors.</li>
        <li><span class="agPos">Position Attributes:</span> Nothing to do with style, however they stick out below, so worth mentioning. These
            are set by ag-Grid to position the rows within the containers. Because rows are virtualised, and widths are dynamic, these
            attributes cannot be set as classes, they are set as dynamic styles by ag-Grid.</li>
    </ul>

<pre class="codeBlock">
&lt;div class='<span class="agClass">ag-root ag-layout-normal</span>'>
  &lt;!-- header -->

  &lt;div class="<span class="agClass">ag-header</span>">
    &lt;div class="<span class="agClass">ag-pinned-header</span>">

      &lt;!-- pinned header cell -->
      &lt;div class="<span class="agClass">ag-header-cell</span>">
        &lt;div class="<span class="agClass">ag-header-label</span>">Athlete&lt;/div>
      &lt;/div>
      &lt;!-- pinned header cell -->
      &lt;div class="<span class="agClass">ag-header-cell</span>">
        &lt;div class="<span class="agClass">ag-header-label</span>">Age&lt;/div>
      &lt;/div>

    &lt;/div>
    &lt;div class="<span class="agClass">ag-header-viewport</span>">
      &lt;div class="<span class="agClass">ag-header-container</span>">

        &lt;!-- main header cell -->
        &lt;div class="<span class="agClass">ag-header-cell</span>">
          &lt;div class="<span class="agClass">ag-header-label</span>">County&lt;/div>
        &lt;/div>
        &lt;!-- main header cell -->
        &lt;div class="<span class="agClass">ag-header-cell</span>">
          &lt;div class="<span class="agClass">ag-header-label</span>">Year&lt;/div>
        &lt;/div>

        &lt;!-- the other header cells... -->

      &lt;/div>
    &lt;/div>
  &lt;/div>

  &lt;!-- body -->
  &lt;div class="<span class="agClass">ag-body</span>">
    &lt;div class="<span class="agClass">ag-pinned-cols-viewport</span>">
      &lt;div class="<span class="agClass">ag-pinned-cols-container</span>">

        &lt;div class="<span class="agClass">ag-row ag-row-even</span>" <span class="agAttr">row="0"</span> <span class="agPos">style="top: 0px; height: 30px;"</span>>
          &lt;div class="<span class="agClass">ag-cell cell-col-0</span>" <span class="agAttr">col="0"</span> <span class="agPos">style="width: 150px;"</span>>Michael Phelps&lt;/div>
          &lt;div class="<span class="agClass">ag-cell cell-col-1</span>" <span class="agAttr">col="1"</span> <span class="agPos">style="width: 90px;"</span>>23&lt;/div>
        &lt;/div>

        &lt;div class="<span class="agClass">ag-row ag-row-odd</span>" <span class="agAttr">row="1"</span> <span class="agPos">style="top: 30px; height: 30px;"</span>>
          &lt;div class="<span class="agClass">ag-cell cell-col-0</span>" <span class="agAttr">col="0"</span> <span class="agPos">style="width: 150px;"</span>>Michael Phelps&lt;/div>
          &lt;div class="<span class="agClass">ag-cell cell-col-1</span>" <span class="agAttr">col="1"</span> <span class="agPos">style="width: 90px;"</span>>19&lt;/div>
        &lt;/div>

        &lt;!-- the other pinned rows... -->

      &lt;/div>
    &lt;/div>
    &lt;div class="<span class="agClass">ag-body-viewport-wrapper</span>">
      &lt;div class="<span class="agClass">ag-body-viewport</span>">
        &lt;div class="<span class="agClass">ag-body-container</span>">

          &lt;div class="<span class="agClass">ag-row ag-row-even</span>" <span class="agAttr">row="0"</span> <span class="agPos">style="top: 0px; height: 30px; width: 830px;"</span>>
            &lt;div class="<span class="agClass">ag-cell cell-col-2</span>" <span class="agAttr">col="2"</span> <span class="agPos">style="width: 120px;"</span>>United States&lt;/div>
            &lt;div class="<span class="agClass">ag-cell cell-col-3</span>" <span class="agAttr">col="3"</span> <span class="agPos">style="width: 90px;"</span>>2008&lt;/div>
            &lt;div class="<span class="agClass">ag-cell cell-col-4</span>" <span class="agAttr">col="4"</span> <span class="agPos">style="width: 110px;"</span>>24/08/2008&lt;/div>
            &lt;!-- the other row cells... -->
          &lt;/div>

          &lt;div class="<span class="agClass">ag-row ag-row-odd</span>" <span class="agAttr">row="1"</span> <span class="agPos">style="top: 30px; height: 30px; width: 830px;"</span>>
            &lt;div class="<span class="agClass">ag-cell cell-col-2</span>" <span class="agAttr">col="2"</span> <span class="agPos">style="width: 120px;"</span>>United States&lt;/div>
            &lt;div class="<span class="agClass">ag-cell cell-col-3</span>" <span class="agAttr">col="3"</span> <span class="agPos">style="width: 90px;"</span>>2004&lt;/div>
            &lt;div class="<span class="agClass">ag-cell cell-col-4</span>" <span class="agAttr">col="4"</span> <span class="agPos">style="width: 110px;"</span>>29/08/2004&lt;/div>
            &lt;!-- the other row cells... -->
          &lt;/div>

          &lt;!-- the other body rows... -->

          &lt;/div>
      &lt;/div>
    &lt;/div>
  &lt;/div>
&lt;/div>
</pre>

    <h2 id="styling-with-for-print">Styling with For Print</h2>

    <p>
        Styling with the option <a href="../javascript-grid-for-print/">domLayout=forPrint</a>
        is similar to styling as normal, however the dom layout is much simpler.
        When laying out for printing, there are no pinned columns and no viewports for scrolling.
    </p>

<pre class="codeBlock">
&lt;div class="<span class="agClass">ag-root ag-layout-for-print</span>">

    &lt;!-- header -->
    &lt;div class="<span class="agClass">ag-header-container</span>">
        &lt;div class="<span class="agClass">ag-header-cell</span>" style="width: 120px;">
            &lt;span>Athlete&lt;/span>
        &lt;/div>
        &lt;div class="<span class="agClass">ag-header-cell</span>" style="width: 90px;">
            &lt;span>Age&lt;/span>
        &lt;/div>

        &lt;!-- the other headers... -->

    &lt;/div>

    &lt;!-- body -->
    &lt;div class="<span class="agClass">ag-body-container</span>">
        &lt;div class="<span class="agClass">ag-row ag-row-even</span>" <span class="agAttr">row="0"</span> <span class="agPos">style="height: 30px; width: 830px;"</span>>
            &lt;div class="<span class="agClass">ag-cell cell-col-0</span>" <span class="agAttr">col="0"</span> <span class="agPos">style="width: 120px;"</span>>Michael Phelps&lt;/div>
            &lt;div class="<span class="agClass">ag-cell cell-col-1</span>" <span class="agAttr">col="1"</span> <span class="agPos">style="width: 90px;"</span>>United States&lt;/div>

            &lt;!-- the other row cells... -->

        &lt;/div>
        &lt;div class="<span class="agClass">ag-row ag-row-odd</span>" <span class="agAttr">row="1"</span> <span class="agPos">style="height: 30px; width: 830px;"</span>>
            &lt;div class="<span class="agClass">ag-cell cell-col-0</span>" <span class="agAttr">col="0"</span> <span class="agPos">style="width: 120px;"</span>>Michael Phelps&lt;/div>
            &lt;div class="<span class="agClass">ag-cell cell-col-1</span>" <span class="agAttr">col="1"</span> <span class="agPos">style="width: 90px;"</span>>United States&lt;/div>

            &lt;!-- the other row cells... -->

        &lt;/div>

        &lt;!-- the other rows... -->

    &lt;/div>
&lt;/div>
</pre>


    <h2 id="customizing-sass-variables">Customizing the themes with Sass variables</h2>

    <p>
    After September 2017, the ag-Grid themes source files got converted to <a href="http://sass-lang.com">Sass</a>, using the scss syntax. 
    If you already use Sass in your project, this means that you can change the looks of the theme you use
    by overriding the theme variables value and referencing the Sass source files afterwards.</p> 

<pre class="codeBlock">
// styles.scss
// This is an example of the application scss file; 
// Popular framework project scaffolders like angular-cli support 
// generating sass enabled projects. 
// For example, the `ng new` command accepts `--style scss`.

// override the font size of the entire grid 
$ag-root-font-size: 10px;

// import the Sass files from the ag-Grid npm package. //
// The "~" path prefix below relies on Webpack's sass-loader -
// https://github.com/webpack-contrib/sass-loader. 
@import "~ag-grid/src/styles/ag-grid.scss";
@import "~ag-grid/src/styles/theme-fresh.scss";
</pre>

<p>A runnable version of the example above is available in the <a href="https://github.com/ag-grid/ag-grid-seed/tree/master/typescript-webpack/src">ag-Grid seed Webpack/typescript project</a>. </p>

<p>Following is a list of the most useful Sass variables, their default values for the fresh theme, and a short explanation of their purpose.</p>


<style scoped>
#sass-variables {
    font-size: 11px;
margin-bottom: 1em;
}
#sass-variables td, th {
    padding: 3px 8px;
    border-bottom: 1px solid #e5e5e5;
    vertical-align: baseline;
}

#sass-variables td:first-child, td:nth-child(2){
    font-family: monospace;
}
</style>
<table width="100%" id="sass-variables">
    <thead>
        <tr>
            <th>Variable Name</th>
            <th>Value</th>
            <th>Description</th>
        </tr>
    </thead>
<tbody>
<colgroup>
    <col style="width:25%;" />
    <col style="width:25%;" />
    <col style="width:50%;font-size: 11px;" />
</colgroup>
<tr><td>ag-root-font-family</td><td> "Helvetica Neue",Helvetica,Arial,sans-serif </td><td> The font family used for the entire grid</td></tr>
<tr><td>ag-root-font-size</td><td> 14px </td><td> The default font size for the cells and headers</td></tr>
<tr><td>ag-border-1</td><td> 1px solid grey </td><td>The border around the cells</td></tr>
<tr><td>ag-background-1</td><td> #f6f6f6 </td><td>The default background color</td></tr>
<tr><td>ag-foreground-1</td><td> #222 </td><td> The default text color</td></tr>
<tr><td>ag-header-foreground-1</td><td> #000 </td><td>The default header text color</td></tr>
<tr><td>ag-header-background-1</td><td> linear-gradient(white, lightgrey) </td><td>The background of the headers</td></tr>
<tr><td>ag-separator-color</td><td> #d3d3d3 </td><td> The color of the separator lines used in the grid UI </td></tr>

<tr><td>ag-cell-focused-border</td><td> 1px solid darkgrey </td><td>The border around the focused cell</td></tr>
<tr><td>ag-cell-ltr-no-focus-border-right</td><td> 1px dotted grey </td><td> The border between the grid cells (LTR mode)</td></tr>
<tr><td>ag-cell-rtl-no-focus-border-left</td><td> 1px dotted grey </td><td> The border between the grid cells (RTL mode) </td></tr>
<tr><td>ag-cell-highlight-border</td><td> 1px solid darkgreen </td><td> The border of the highlighted cells </td></tr>

<tr><td>ag-row-selected-background-color</td><td> powderblue </td><td> The background of the selected row </td></tr>
<tr><td>ag-row-odd-background-color</td><td> #f6f6f6 </td><td>The odd colors of the rows </td></tr>
<tr><td>ag-row-even-background-color</td><td> white </td><td>The even colors of the rows </td></tr>
<tr><td>ag-row-floating-background-color</td><td> #f0f0f0 </td><td> The floating row background color </td></tr>
<tr><td>ag-row-stub-background-color</td><td> #f0f0f0 </td><td> The stub row background color </td></tr>

<tr><td>ag-value-change-delta-up-color</td><td> darkgreen </td><td> The color for the increase delta notification</td></tr>
<tr><td>ag-value-change-delta-down-color</td><td> darkred </td><td> The color for the decrase delta notification </td></tr>
<tr><td>ag-value-change-value-highlight-background-color</td><td> #cec </td><td> The background for the changed cell notification </td></tr>

<tr><td>ag-button-background-1</td><td> linear-gradient(white, lightgrey) </td><td> The background of the buttons </td></tr>
<tr><td>ag-button-foreground-1</td><td> #000 </td><td> The text color of the buttons </td></tr>
<tr><td>ag-button-border-1</td><td> #808080 </td><td> The border of the buttons </td></tr>

<tr><td>ag-select-background</td><td> white </td><td> The selection background </td></tr>
<tr><td>ag-select-foreground</td><td> #222 </td><td> The selection color </td></tr>
</tbody>
</table>

<p>You can examine the full, up-to-date list of the Sass variables and their usage in <a href="https://github.com/ag-grid/ag-grid/tree/master/src/styles">the source code of the themes</a>.
The <code>_theme-common.scss</code> file contains the actual implementation, while the <code>theme-*.scss</code> contain the default variable values for each theme.
</p>

</div>


<?php include '../documentation-main/documentation_footer.php';?>
