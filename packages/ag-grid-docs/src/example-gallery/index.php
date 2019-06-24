<?php
$pageTitle = "ag-Grid Examples: A Gallery showcasing our Features";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page shows a range of examples mixing different parts of the library.";
$pageKeyboards = "ag-Grid Gallery";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

    <h1>Gallery</h1>

    <p class="lead">
        This section of the documentation demonstrates different configurations of the grid.
        It is really a mixed bag section, showing combinations of grid features working together that
        doesn't fit into a particular documentation section.
    </p>

    <h2>Flower Nodes</h2>

    <p>
        Version 14.2 of ag-Grid introduced full support for Master / Detail. Before this, users had
        to implement master / detail using flower nodes. Flower nodes are now deprecated. However to
        check for backwards compatibility, flower node examples are presented here for regression
        testing purposes.
    </p>

    <p>
        Below shows using flower nodes to provide a master / detail experience.
    </p>

    <?= example('Flower Nodes', 'flower-nodes', 'generated', array("processVue" => true)) ?>



<?php include '../documentation-main/documentation_footer.php';?>
