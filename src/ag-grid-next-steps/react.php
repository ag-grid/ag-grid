<?php if (!isFrameworkAll()) { ?>
    <h2><img style="vertical-align: middle" src="/images/react_small.png" height="25px"/> Next Steps</h2>
<?php } ?>

<?php
$framework_enterprise = 'import React from "react";
import {AgGridReact} from "ag-grid-react";
import "ag-grid-enterprise";
...other dependencies';

include '../javascript-grid-getting-started/ag-grid-enterprise-framework.php'
?>

<h2 id="next-steps">Next Steps</h2>

<p>
    Now would
    be a good time to try it in a simple app and get some data displaying and practice with
    some of the grid settings before moving onto the advanced features of cellRendering
    and custom filtering.
</p>

<h2 id="cell-rendering-cell-editing-and-filtering-using-react">Cell Rendering, Cell Editing and Filtering using
    React</h2>

<p>
    It is possible to build <a href="../javascript-grid-cell-rendering/#reactCellRendering">cellRenderers</a>,
    <a href="../javascript-grid-cell-editing/#reactCellEditing">cellEditors</a> and
    <a href="../javascript-grid-filtering/#reactFiltering">filters</a> using React. Doing each of these
    is explained in the section on each.
</p>

<p>
    Although it is possible to use React for your customisations of ag-Grid, it is not necessary. The grid
    will happily work with both React and non-React portions (eg cellRenderers in React or normal JavaScript).
    If you do use React, be aware that you are adding an extra layer of indirection into ag-Grid. ag-Grid's
    internal framework is already highly tuned to work incredibly fast and does not require React or anything
    else to make it faster. If you are looking for a lightning fast grid, even if you are using React and
    the ag-grid-react component, consider using plain ag-Grid Components (as explained on the pages for
    rendering etc) inside ag-Grid instead of creating React counterparts.
</p>
