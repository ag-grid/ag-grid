<?php
$pageTitle = "Accessibility: A Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. The grid has ARIA roles inside the cells for Accessibility to enable navigation with screen readers. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Accessibility";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>
        Accessibility
    </h1>

    <p class="lead">
        ag-Grid provides amongst the best support for accessibility compared to other grids available on the market today.  
        This page provides guidance on how to address accessibility concerns in your grid implementations.
    </p>


    <h2>Web Conformance Guidelines</h2>

    <p>
        Even if you are not mandated to conform to any particular accessibility standard, it can be helpful to understand the
        guidelines outlined as they are generally good practices worth incorporating into your web based applications.
    </p>

    <p> Currently the most commonly encountered conformance guidelines are: </p>

        <ul class="content">
            <li><a href="https://www.ada.gov">ADA</a> - US Department of Justice</li>
            <li><a href="https://www.section508.gov">Section 508</a> - US federal agencies</li>
            <li><a href="https://www.w3.org/WAI/intro/wcag">WCAG 2.0</a> - globally accepted standard</li>
        </ul>

    <p> WCAG 2.0 has 3 levels of conformance; A, AA and AAA (in order of conformance) </p>

    <p>
        As meeting WCAG 2.0 level AA guidelines also meets the ADA and Section 508 standards, it is likely that most organisations will want to target this standard.
    </p>

    <h2>High Contrast Theme</h2>
    <p>
        For users that are visually impaired due to colour deficiencies, care should be taken when using colours to provide information.
    </p>
    <p>
        Using our demo page as an example, the chrome plugin <a href="https://chrome.google.com/webstore/detail/colorblinding/dgbgleaofjainknadoffbjkclicbbgaa?hl=en">Colorblinding</a>
        shows how cells with colour indicators might appear to someone with total colour blindness (Monochromacy).
    </p>
        <img class="img-fluid" src="accessibility-colour-contrast.png"/>
    <p>
        To create a high contrast theme please check out the <a href="../javascript-grid-styling/">Themes</a>
        documentation for details.
    </p>

    <h2>Keyboard navigation</h2>

    <p>Users who have motor disabilities, as well as visually impaired users, often rely on keyboards for navigation.</p>

    <p>For details on how to navigate the grid without using a mouse refer to the
        <a href="../javascript-grid-keyboard-navigation/">Keyboard Navigation</a> documentation. Note that it is possible
        to provide custom navigation which could come in useful for some accessibility requirements.</p>

    <h2>Skip Navigation</h2>

    <p>It may also be worth considering providing a "skip link" to easily navigate to the grid. For example you could
        provide a hyperlink to the grid class attribute, i.e. href='#myGrid'.</p>

    <p>The following css snippet shows how you could also hide this link by default and then reveal it when tabbed into:</p>

    <snippet>
.skip-link {
      left: -100%;
      position: absolute;
    }
    .skip-link:focus {
      left: 50%;
    }</snippet>

    <h2>Screen Readers</h2>

    <p>
        Users who are blind or visually impaired will typically require the assistance of a screen reader to interpret and
        interact with grid based application.
    </p>

    <p>There are numerous screen readers available, however right now the most popular screen reader for Windows is
       <a href="https://www.freedomscientific.com/Downloads/JAWS">JAWS</a> and for MAC users it is the embedded
       <a href="http://help.apple.com/voiceover/info/guide">VoiceOver</a> software. Our testing has focused on these
        screen readers.
    </p>

    <h2>ARIA Attributes</h2>

    <p>
        In order to give screen readers the contextual information they require to interpret and interact with the grid,
        <a href="https://www.w3.org/TR/wai-aria/">ARIA</a> attributes are added to the grid DOM elements. These
        attributes are particularity useful when plain HTML elements such <code>div</code> and <code>span</code> are used to create
        complex DOM structures, which is the case with ag-Grid.
    </p>

    <p>
        When inspecting the DOM you'll notice the following roles and properties have been added:
    </p>

        <ul class="content">
            <li><b>role="grid"</b> - marks the enclosing element of the grid</li>
            <li><b>role="row"</b> - a row of column headers or grid cells</li>
            <li><b>role="columnheader"</b> - element containing a column header</li>
            <li><b>role="gridcell"</b> - element containing a grid cell </li>
            <li><b>role="presentation"</b> - indicates an element should be ignored</li>
            <li><b>aria-hidden="true"</b> - indicates an element and child elements should be ignored</li>
        </ul>

    <p>
        These attributes will enable screen readers to interpret and navigate the columns and rows of the grid.
        Grids with simple layouts (e.g. without column groups, pinned columns or pivoting) will have best results.
    </p>

    <note>
        Some other grids claim to provide support for complex grid layouts and interactions but based on our own
        independent testing and the feedback we've received from our users this is clearly not the case.
    </note>

    <h2 id="dom-order">Column and Row Order</h2>

    <p>
        By default rows and columns can appear out of order in the DOM. This 'incorrect order' can result in inconsistent
        results when parsed by screen readers.
    </p>

    <p>To force row and column order, enable the following gridOptions property like so:</p>

    <snippet>
gridOptions.ensureDomOrder = true</snippet>

    <note>Animations won't work properly when the DOM order is forced, so ensure they are not enabled.</note>

    <h2 id="dom-order">Column and Row Virtualisation</h2>

    <p>
        By default the grid uses virtualisation; a technique whereby the grid draws columns and rows as the user scrolls.
        This can be problematic for keyboard navigation and screen readers as not all rows and columns will be available
        in the DOM.
    </p>
    <p>
        To overcome this it may be necessary to disable visualisation at the expense of increasing the memory footprint.
    </p>

    <p>
        Column virtualisation can be disabled as follows:
    </p>

    <snippet>
gridOptions.suppressColumnVirtualisation = true</snippet>

    <p>
        This mean if you have 100 columns, but only 10 visible due to scrolling, all 100 will always be rendered.
    </p>

    <p> There is no property to suppress row virtualisation however if you want to do this you can set the rowBuffer
        property to be very large as follows:
    </p>

    <snippet>
gridOptions.rowBuffer = 9999</snippet>

    <p>
        This sets number of rows rendered outside the scrollable viewable area the grid renders. The defaults is 20.
    </p>

    <p>
        However note that lots of rendered rows will mean a very large amount of rendering in the DOM which will slow things down.
    </p>

    <p>
        As an alternative you may want to consider using <a href="../javascript-grid-pagination/">Pagination</a> instead
        to constrain the amount of visible rows.
    </p>

    <h2 id="example-accessibility">Example - Accessibility</h2>

    <p>
        The example below presents a simple grid layout with the following properties enabled:
    </p>

    <ul class="content">
        <li>
            <code>ensureDomOrder</code> - ensures the rows and columns in the DOM always appear in the same order as displayed in the grid.
        </li>
        <li>
            <code>suppressColumnVirtualisation</code> - ensures all columns are rendered, i.e. appears in the DOM.
        </li>
        <li>
            <code>rowBuffer</code> - sets the number of rows rendered outside of the scrollable viewable area.
        </li>
    </ul>

    <?= example('Accessibility', 'accessibility', 'generated', array("enterprise" => 1)) ?>

    <note>
        Tested on Windows using JAWS (version 18) and Mac using VoiceOver (Sierra 10.12.4)
    </note>
<?php include '../documentation-main/documentation_footer.php';?>
