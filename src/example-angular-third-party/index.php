<?php
$key = "Angular Third Party";
$pageTitle = "ag-Grid Angular Rich Grid";
$pageDescription = "A feature rich Grid example, demonstrating many of ag-Grid's features, including Date, Header and Header Group Components.";
$pageKeyboards = "ag-Grid angular feature rich grid";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>
    <h2>ag-Grid Angular Examples Using Third Party Libraries</h2>

    <p>This page offers some suggestions and ideas of how third-party libraries can be used with ag-Grid.</p>

    <hr/>

<!--    <div class="row">-->
<!--        <div class="col-sm-6">-->
<!--            <a href="#typeahead" class="column-links column-items">ag-Grid with TypeAhead Component</a>-->
<!--        </div>-->
<!--        <div class="col-sm-6">-->
<!--        </div>-->
<!--    </div>-->

    <h4 id="typeahead">ag-Grid with TypeAhead Component</h4>
    <p>This example uses the <code>ng2-typeahead</code> directive as part of an Editor Component.</p>
    <p>Please note that <code>ng2-typeahead</code> does not appear to be AOT friendly, so please keep this in mind if you choose to use it.</p>

    <show-plunker-example sources="{
                            [
                                { root: '/example-angular-third-party/typeahead/', files: 'typeahead.component.ts,typeahead.component.html,typeahead.css,typeahead-editor.component.ts,app.module.ts' },
                            ]
                          }"
                          plunker="https://embed.plnkr.co/xpgLo8/"
                          exampleHeight="525px">
    </show-plunker-example>

    <hr/>

    <h4 id="ng2bootstrap">Cell Editor with ng2-bootstrap Components</h4>
    <p>This example uses <code>ng2-bootstrap</code> as part of an Editor Components.</p>
    <ul>
        <li>Date Picker</li>
        <li>Dropdown</li>
        <li>Radio Button - in this case demonstrating how you can do inline editing of cell values</li>
    </ul>

    <show-plunker-example sources="{
                            [
                                { root: '/example-angular-third-party/ng2-bootstrap/', files: 'bootstrap-editor.component.ts,bootstrap-editor.component.html,date-picker.component.ts,dropdown.component.ts,radio-buttons.component.ts,app.component.html,app.module.ts' },
                            ]
                          }"
                          plunker="https://embed.plnkr.co/925YB2/"
                          exampleHeight="525px">
    </show-plunker-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
