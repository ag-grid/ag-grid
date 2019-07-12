<?php
$pageTitle = "Column Header: Styling & Appearance Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Column Headers. The display of column headers can be fine-tuned to change Header Height and Text Orientation for example. Version 20 is available for download now, take it for a free two month trial.";
$pageKeyboards = "grid header";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Column Interface</h1>

    <p class="lead">
        Your application interacts with columns through the grid's column interface. The column interface
        is defined as all the public facing parts of the columns that your application interacts with.
        This section list all the column methods, properties, events e.t.c. for interacting with
        the grid's columns.
    </p>

    <p>
        The column interface is the combination of the following items:
    </p>

    <ul>
        <li>
            <a href="../javascript-grid-column-properties/">Column Properties</a>:
            Columns are configured through column definitions. A column definition contains the column properties
            e.g. <code>colDef.pinned='left'</code>.
        </li>
        <li>
            <a href="../javascript-grid-column-api/">Column API</a>:
            The column API is similar to the grid API, the difference is that the column API provides methods
            relevant to columns e.g. <code>columnApi.setColumnVisible('country',false)</code>.
        </li>
        <li>
            <a href="../javascript-grid-column/">Column Object</a>:
            Each column in the grid is represented by a Column object, which in turn has a reference to the column
            definition provided by the application. The Column wraps the Column Definition.
            The Column object has attributes, methods and events for interacting
            with the specific column e.g. <code>column.isVisible()</code>.
        </li>
    </ul>




<?php include '../documentation-main/documentation_footer.php';?>

