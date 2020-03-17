<?php
$pageTitle = "ag-Grid Reference: JavaScript Datagrid - Download";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page covers downloading the JavaScript packages for ag-Grid and ag-Grid Enterprise.";
$pageKeywords = "JavaScript Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

    <h1>DOM Virtualisation</h1>

    <p class="lead">The grid uses DOM virtualistaion to vastly improve rendering performance.</p>

    <p>
        If you loaded 1,000 records with 20 columns into the browser without using a datagrid
        (eg using 'table', 'tr' and 'td' tags), then the page would end up with a lot of rendered
        DOM elements. This would drastically slow down the web page. This results in either a very
        poor user experience, or simply crashing the browser as the browser runs out of memory.
    </p>

    <p>
        To get around this, the grid only renders what you see on the screen. For example if
        you load 1,000 records and 20 columns into the grid, but the user can only see 50 records
        and 10 columns (as the rest are not scrolled into view), then the grid only renders
        the 50 rows adn 10 columns that the user can actually see.
    </p>

    <p>
        As the user scrolls horizontally or vertically, the grid dynamically updates the DOM
        and renders the additional cells that are required while also removing the cells that
        are no longer in view.
    </p>

    <p>
        This technique of only rendering into the DOM what is in the visible scrollable viewport
        is known as row and column virtualisation.
    </p>

    <h2>Inspect the DOM</h2>

    <p>
        To observe row and column virtualisation, you are invited to inspect the DOM of the grid
        using the browsers developer tools and notice row rows and column DOM elements (i.e. the 'div' elements)
        get inserted and removed as the grid scrolls.
    </p>

    <h2>Row Virtualisation</h2>

    <p>
        Row virtualisation is the insertion and removal of rows as the grid scrolls vertically.
    </p>

    <p>
        By default the grid will render 10 rows before the first visible row and 10 rows after
        the last visible row, thus 20 additional rows get rendered. This is to act as a buffer
        as on some slower machines and browsers, a blank space can be seen as the user scrolls.
    </p>

    <p>
        To change the row buffer, set grid property <code>rowBuffer</code> to the number of rows
        you would like to render in addition to the visible rows. Set <code>rowBuffer=0</code>
        to turn off row buffering.
    </p>

    <note>
        As a safety measure, the grid will render a maximum of 500 rows. This is to stop applications
        from crashing if they incorrectly set the grid size (ie if they don't size the grid correctly,
        and the grid tries to render 10,000 rows, this can crash the browser). To remove
        this restriction set the property <code>suppressMaxRenderedRowRestriction=true</code>.
    </note>

    <h2>Column Virtualisation</h2>

    <p>
        Column virtualisation is the insertion and removal of columns as the grid scrolls horizontally.
    </p>

    <p>
        There is no column buffer - no additional columns are rendered apart from the visible set.
        This is because horizontal scrolling is not as CPU intensive as vertical scrolling, thus
        the buffer is not needed for a good UI experience.
    </p>

    <p>
        To turn column virtualisation off set the grid property <code>suppressColumnVirtualisation=true</code>.
    </p>

<?php include '../documentation-main/documentation_footer.php'; ?>

