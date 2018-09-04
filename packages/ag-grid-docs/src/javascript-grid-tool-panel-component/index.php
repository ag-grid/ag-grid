<?php
$pageTitle = "Tool Panel Component: Enterprise Grade Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Tool Panel. The Tool Panel allows the user to manipulate the list of columns, such as show and hide, or drag columns to group or pivot. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Tool Panel Component";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Tool Panel Component</h1>

    <p class="lead">
        Custom Tool Panel Components can be included into the grids Side Bar. Implement these when the provided Tool Panels
        do not meet your application requirements.
    </p>

    <h2>Tool Panel Interface</h2>

    <p> Implement this interface to provide a custom Tool Panel Components to the grids Side Bar.</p>

<snippet>
interface IToolPanel {

    // The init(params) method is called on the tool panel once. See below for details on the parameters.
    init(params: IToolPanelParams): void;

    // Returns the GUI for this overlay. The GUI can be a) a string of html or b) a DOM element or node.
    getGui(): any;

    // Return true if the refresh succeeded, otherwise return false.
    // If you return false, the grid will remove the component from the DOM and create a new component in
    // it's place with the new values.
    refresh(): void;
}
</snippet>

<snippet>
interface IToolPanelParams {

    // The grid API
    api: any;
}
</snippet>

    <h2>Custom Tool Panel Example</h2>

    <p>
        The example below shows the 'Custom Stats' Tool Panel Component in the Side Bar:
    </p>

<?= example('Custom Stats', 'custom-stats', 'generated', array('enterprise' => true, 'extras' => array('fontawesome')) ) ?>

<?php include '../documentation-main/documentation_footer.php';?>