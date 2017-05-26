<?php
$key = "React Rich Grid";
$pageTitle = "ag-Grid React Rich Grid";
$pageDescription = "A feature rich Grid example, demonstrating many of ag-Grid's features, including Date, Header and Header Group Components.";
$pageKeyboards = "ag-Grid react feature rich grid";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>React Rich Grid Example</h2>
    <p>A feature rich Grid example, demonstrating many of ag-Grid's features, including Date, Header and Header Group Components.</p>

    <show-complex-example example="../react-examples/examples/?fromDocs&example=rich-grid"
                          sources="{
                            [
                                { root: '/react-examples/examples/src/richGridExample/', files: 'ColDefFactory.jsx,NameCellEditor.jsx,RichGridExample.css,SkillsFilter.jsx,MyReactDateComponent.jsx,ProficiencyCellRenderer.jsx,RichGridExample.jsx,MyReactHeaderComponent.jsx,ProficiencyFilter.jsx,RowDataFactory.js,MyReactHeaderGroupComponent.jsx,RefData.js,SkillsCellRenderer.jsx' }
                            ]
                          }"
                          exampleHeight="525px">
    </show-complex-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
