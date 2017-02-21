<?php
$key = "Styling";
$pageTitle = "ag-Grid Styling";
$pageDescription = "ag-Grid Styling";
$pageKeyboards = "ag-Grid Styling";
$pageGroup = "free";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="styling">Styling</h2>

    ag-Grid is designed to have it's look and feel derived from a theme.

    <p/>
    Out of the box, five themes are provided, ag-fresh, ag-blue, ag-dark, ag-material and ag-bootstrap.
    <p/>
    To use a theme, add the theme class name to the div element where the ag-Grid directive is attached.
    <p/>
    The following is an example of using the ag-fresh theme:<br/>
    <pre>&lt;div ag-grid="gridOptions" class="ag-fresh">&lt;/div></pre>
    <p/>
    The following is an example of using the ag-dark theme:<br/>
    <pre>&lt;div ag-grid="gridOptions" class="ag-dark">&lt;/div></pre>

    <p/>
    To create a new theme, either create one from scratch (difficult), or start with one of the provided
    themes that can be found on GitHub here:
    <a href="https://github.com/ceolter/ag-grid/tree/master/src/styles">https://github.com/ceolter/ag-grid/tree/master/src/styles</a>

    <note>
        If no want something similar to a provided theme, eg you like the Dark theme but want less padding
        in the cells, then use the Dark theme and provide your own CSS to override what you don't like
        in the provided theme. Your browser will apply the last CSS loaded if the same style item is
        applied twice, allowing you to tweak the provided themes.
    </note>

    <p/>
    This section does not provide an example of building a theme as a number of themes
    are already provided with ag-Grid - these can be used as a basis for any additional themes you may wish to create.

    <div class="bigTitle" id="when-to-style-via-themes">When to Style via Themes</div>

    Themes are intended to change the overall look and feel of a grid. If you want to style a particular
    column, or a particular header, consider using either cell and header renderers, or applying css
    classes or styles at the column definition level.
    <p/>
    Sometimes it is possible to achieve the same effect using custom renderers as it is with themes.
    If so, use whichever one makes more sense for you, there isn't a hard and fast rule.

    <div class="bigTitle" id="what-to-style-via-themes">What to Style via Themes</div>

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

    <div class="bigTitle" id="structure-example">Structure Example</div>

    The exact structure of the DOM within ag-Grid is dependent on it's configuration and what data is present.
    This page takes the below basic example grid, with one pinned column, as an example to demonstrate the DOM structure.
    The reader is encouraged to inspect the DOM (using your browsers developer tools) to dig deeper.
    <p/>

    <show-example example="example1"></show-example>

    <div class="bigTitle" id="high-level-overview">High Level Overview</div>
    <p/>
    The diagram below shows the hierarchy of the core div elements which form the four quadrants
    of the table. The four quadrants are as follows:
    <p/>
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

    <div class="bigTitle" id="detailed-breakdown">Detailed Breakdown</div>

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
&lt;div class='<span class="agClass">ag-root ag-scrolls</span>'>
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

    <div class="bigTitle" id="styling-with-no-scrolls">Styling with No Scrolls</div>

    Styling with the option 'no scrolls' is similar to styling with scrolls, however the dom layout is much simpler.
    When no scrolls, there are no pinned columns and no viewports for scrolling.

    <p/>

<pre class="codeBlock">
&lt;div class="<span class="agClass">ag-root ag-no-scrolls</span>">

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

</div>

<?php include '../documentation-main/documentation_footer.php';?>
