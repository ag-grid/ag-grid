<?php
$key = "Angular Third Party";
$pageTitle = "ag-Grid Angular Third Party Examples";
$pageDescription = "A feature rich Grid example, demonstrating many of ag-Grid's features, including Date, Header and Header Group Components.";
$pageKeyboards = "ag-Grid angular features third party material design typeahead bootstrap";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>
    <h2>ag-Grid Angular Examples Using Third Party Libraries</h2>

    <p>This page offers some suggestions and ideas of how third-party libraries can be used with ag-Grid.</p>

    <note>The source code for the ng2-bootstrap and Material Design examples can also be found in <a
                href="https://github.com/seanlandsman/ag-grid-angular-third-party-example" target="_blank">Github</a></note>
    <hr/>

    <div class="row">
        <div class="col-sm-6">
            <a href="#material-design1" class="column-links column-items">ag-Grid with Material Design Components - Set
                1</a>
            <a href="#material-design2" class="column-links column-items">ag-Grid with Material Design Components - Set
                2</a>
            <a href="#typeahead" class="column-links column-items">ag-Grid with a TypeAhead Component</a>
            <a href="#typeahead" class="column-links column-items">ag-Grid with ng2-boostrap Components</a>
        </div>
    </div>

    <hr/>

    <h4 id="material-design1">ag-Grid with Material Design Components - Set 1</h4>
    <p>This example uses the <code>Material Design</code> components as part of Editor Components.</p>

    <show-plunker-example sources="{
                            [
                                {
                                    root: '/example-angular-third-party/material-design/',
                                    files: 'md-editor-one.component.ts,md-editor-one.component.html,md-checkbox.component.ts,md-input.component.ts,md-radio.component.ts,md-select.component.ts'
                                },
                            ]
                          }"
                          plunker="https://embed.plnkr.co/ukuYRw/"
                          exampleHeight="525px">
    </show-plunker-example>

    <h4 id="material-design2">ag-Grid with Material Design Components - Set 2</h4>
    <p>This example uses the <code>Material Design</code> components as part of Editor Components, as well as an example of using a <code>Material Design</code> component in the Header.</p>

    <show-plunker-example sources="{
                            [
                                {
                                    root: '/example-angular-third-party/material-design/',
                                    files: 'md-editor-two.component.ts,md-editor-two.component.html,md-button-toggle.component.ts,md-slider.component.ts,md-progress-spinner.component.ts'
                                },
                            ]
                          }"
                          plunker="https://embed.plnkr.co/EnYut6/"
                          exampleHeight="525px">
    </show-plunker-example>

    <hr/>

    <h4 id="ng2bootstrap">ag-Grid with ng2-bootstrap Components</h4>
    <p>This example uses the <code>ng2-boostrap</code> components as part of Editor Components.</p>

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

<?php include '../documentation-main/documentation_footer.php'; ?>
