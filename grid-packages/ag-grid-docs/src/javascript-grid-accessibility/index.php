<?php
$pageTitle = "Accessibility: A Core Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. The grid has ARIA roles inside the cells for Accessibility to enable navigation with screen readers.";
$pageKeywords = "ag-Grid Accessibility";
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
        <img class="img-fluid" src="accessibility-colour-contrast.png" alt="High Contrast Theme" />
    <p>
        To create a high contrast theme please check out the <a href="../javascript-grid-styling/">Themes</a>
        documentation for details.
    </p>

    <h2>Keyboard navigation</h2>

    <p>Users who have motor disabilities, as well as visually impaired users, often rely on keyboards for navigation.</p>

    <p>For details on how to navigate the grid without using a mouse refer to the
        <a href="../javascript-grid-keyboard-navigation/">Keyboard Navigation</a> documentation. Note that it is possible
        to provide custom navigation which could come in useful for some accessibility requirements.</p>

    <h2>Screen Readers</h2>

    <p>
        Users who are visually impaired will typically require the assistance of a screen reader to interpret and
        interact with grid based application.
    </p>

    <p>There are numerous screen readers available, however right now the most popular screen reader for Windows is
       <a href="https://www.freedomscientific.com/Downloads/JAWS">JAWS</a> and for MAC users it is the embedded
       <a href="http://help.apple.com/voiceover/info/guide">VoiceOver</a> software. Our testing has focused on these
        screen readers.
    </p>

    <p>
        In order to cover the widest range of use cases and screen readers, ag-Grid has taken a standards-based approach to 
        implementing accessibility support. Instead of optimizing our implementation for specific screen readers, we have followed the 
        W3C WCAG standard and added the relevant ARIA-tags to let screen readers announce any ag-Grid element and its state. However, different 
        screen readers interpret the WCAG standard in different ways. As a result, they may generate different announcements for the same 
        ag-Grid element, or no announcement at all. This is why we recommend testing how different screen readers announce the UI of the 
        application you're using, selecting the best one and recommending that to your users. We believe this is the best way to guide your 
        users how to get the best possible experience at this time until screen readers improve their support for the WCAG standard.
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
            <li>
                <b>role="grid"</b> - marks the enclosing element of the grid.
                <ul>
                    <li><b>aria-rowcount</b> - announces the number of rows.</li>
                    <li><b>aria-colcount</b> - announces the number of rows.</li>
                    <li><b>aria-multiselectable="true"</b> - marks the grid as being able to select multiple rows.</li>
                </ul>
            </li>
            <li><b>role="rowgroup"</b> - element that serve as container for the table header rows and grid rows.</li>
            <li>
                <b>role="row"</b> - a row of column headers or grid cells.
                <ul>
                    <li><b>aria-rowindex</b> - announces the visible index of the row.</li>
                    <li><b>aria-selected</b> - only present if the row is selectable, it announces the selection state.</li>
                    <li><b>aria-expanded</b> - only present in row groups, it announces the expand state.</li>
                </ul>
            </li>
            <li>
                <b>role="columnheader"</b> - element containing a column header.
                <ul>
                    <li><b>aria-colindex</b> - announces the visible index of the column.</li>
                    <li><b>aria-colspan</b> - only present if the column spans across multiple columns, it helps guide screen readers.</li>
                    <li><b>aria-expanded</b> - only present in grouped headers, it announces the expand state.</li>
                    <li><b>aria-sort</b> - only present in sortable columns, it announces the sort state.</li>
                </ul>
            </li>
            <li>
                <b>role="gridcell"</b> - element containing a grid cell.
                <ul>
                    <li><b>aria-colindex</b> - announces the visible index of the cell.</li>
                    <li><b>aria-selected</b> - only present if the cell is selectable, it announces the selection state.</li>
                    <li><b>aria-expanded</b> - only present in a group cell, it announces the expand state.</li>
                </ul>
            </li>
            <li><b>role="menu"</b> - element that serve as a container for a single levels of menu items.</li>
            <li><b>role="menuitem"</b> - marks an element as a menu item.</li>
            <li><b>role="tree"</b> - element that serve as a container for items that could have multiple levels.</li>
            <li>
                <b>role="treeitem"</b> - marks an element as an item of a tree.
                <ul>
                    <li><b>aria-level</b> - announces the current level of the tree.
                    <li><b>aria-expanded</b> - only present if the item has subitems, it announces the current expand state.</li>
                </ul>
            </li>
            <li><b>role="listbox"</b> - element that serve as a container for multiple elements that will be presented as a list.</li>
            <li>
                <b>role="option"</b> - marks an element as an item of a listbox.
                <ul>
                    <li><b>aria-setsize</b> - announces the total number of items in the listbox.</li>
                    <li><b>aria-posinset</b> - announces the position of the item within the set.</li>
                    <li><b>aria-selected</b> - only present if the item is selectable, it announces the current select state.</li>
                    <li><b>aria-checked</b> - only present if the item has a checkbox, it announces the current check state.</li>
                </ul>
            <li><b>role="presentation"</b> - indicates an element should be ignored.</li>
            <li><b>aria-hidden="true"</b> - indicates an element and child elements should be ignored.</li>
            <li><b>aria-label</b> - used to provide information about the current focused item.</li>
            <li><b>aria-labelledby</b> - used to provide the id of an element that has the label for the current focused element.</li>
            <li><b>aria-describedby</b> - used to provide additional information about the current selected item.</li>
        </ul>

    <p>
        These attributes will enable screen readers to interpret and navigate the columns and rows of the grid.
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

    <h2 id="example-accessibility">Example: Accessibility</h2>

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

    <?= grid_example('Accessibility', 'accessibility', 'generated', ['enterprise' => true]) ?>

    <h2>Known Issues</h2>

    <p>Because of the way the DOM is structured and how screen readers work, the issues below were observed: </p>

    <ul class="content">
        <li>Navigating from and to pinned columns.</li>
        <li>Navigating from and to pinned rows.</li>
        <li>Problems announcing the correct name of columns while using grouped columns.</li>
        <li>Problems announcing the change of state of a gridcell or gridheader.</li>
        <li>Server Side Row Model - Announcing the row count in the grid when using SSRM is not supported. This is because the row count cannot be known in all the scenarios where SSRM is in use.</li>
    </ul>

<?php include '../documentation-main/documentation_footer.php';?>
