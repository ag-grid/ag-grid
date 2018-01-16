<?php
$pageTitle = "ag-Grid Examples";
$pageDescription = "ag-Grid Examples";
$pageKeyboards = "ag-Grid Examples";
$pageGroup = "examples";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>



    <h1> Examples</h1>

    <p class="lead">In this section we show 
            complex examples combining different features of the grid 
            or using frameworks where the implementation is significantly different to
            the plain JavaScript version. For example how to build use Redux with React, or RxJS with Angular.

</p>

<p>
    If you are looking for a particular feature, please refer to the features section for details
    on that feature. Use this section for reference on how to configure ag-Grid.
</p>

<div class="docs-homepage-section-preview">
    <div>
        <h2>Redux</h2>
        <p>A simple example using Redux to manage the data to be displayed, making use of ag-Grids deltaRowDataMode to ensure only the changed rows are re-renderered.  </p>
        <p><a href="../example-react-redux/">Go To Redux</a></p>
    </div>
</div>
<div class="docs-homepage-section-preview">
    <div>
        <h2>Angular RxJS</h2>
        <p>Angular Component using RxJs Example.</p>
        <p><a href="../example-angular-rxjs/">Go To Angular RxJS</a></p>
    </div>
</div>
<div class="docs-homepage-section-preview">
    <div>
        <h2>Angular & Material Design</h2>
        <p>ag-Grid Angular Examples with Material Design Components. </p>
        <p><a href="../example-angular-material-design/">Go To Angular & Material Design</a></p>
    </div>
</div>
<div class="docs-homepage-section-preview">
    <div>
        <h2>Angular & ngx Bootstrap</h2>
        <p>ag-Grid Angular Examples with ngx-bootstrap.</p>
        <p><a href="../example-angular-ngx-bootstrap/">Go To Angular & ngx Bootstrap</a></p>
    </div>
</div><div class="docs-homepage-section-preview">
    <div>
        <h2>Angular with Typeahead</h2>
        <p>This example uses the ng2-typeahead directive as part of an Editor Component.</p>
        <p><a href="../example-angular-typeahead/">Go To Angular with Typeahead</a></p>
    </div>
</div><div class="docs-homepage-section-preview">
    <div>
        <h2>Styled Report</h2>
        <p>An example combining different features and adding custom style.  </p>
        <p><a href="../example-account-report/">Go To Styled Report</a></p>
    </div>
</div><div class="docs-homepage-section-preview">
    <div>
        <h2>File Browser</h2>
        <p>The example shows how you can make complex tree structure using ag-Grid.  </p>
        <p><a href="../example-file-browser/">Go To File Browser</a></p>
    </div>
</div><div class="docs-homepage-section-preview">
    <div>
        <h2>Expressions & Context</h2>
        <p>Shows extensive use of value getters (using expressions) and class rules (again using expressions). The grid shows 'actual vs budget data and yearly total' for widget sales split by city and country.  </p>
        <p><a href="../example-expressions-and-context/">Go To Expressions & Context</a></p>
    </div>
</div><div class="docs-homepage-section-preview">
    <div>
        <h2>Import Excel</h2>
        <p>We illustrate how you might import an Excel spreadsheet into ag-Grid using a third-party library - in this example we're using xlsx-style.</p>
        <p><a href="../example-excel-import/">Go To Import Excel</a></p>
    </div>
</div><div class="docs-homepage-section-preview">
    <div>
        <h2>Gallery</h2>
        <p>This section of the documentation demonstrates different configurations of the grid. It is really a mixed bag section, showing combinations of grid features working together that doesn't fit into a particular documentation section.</p>
        <p><a href="../example-gallery/">Go To Gallery</a></p>
    </div>
</div><div class="docs-homepage-section-preview">
    <div>
        <h2>OpenFin Dashboard</h2>
        <p>A trader dashboard with tear out windows. </p>
        <p><a href="../javascript-grid-openfin-dashboard/">Go To OpenFin Dashboard</a></p>
    </div>
</div><div class="docs-homepage-section-preview">
    <div>
        <h2>Graphing</h2>
        <p>Sometimes however a picture (or graph) is worth a thousand words, so in this section we offer some examples of how you can interact with external Graphs, or embed Graphs into ag-Grid itself. </p>
        <p><a href="../javascript-grid-graphing/">Go To Graphing</a></p>
    </div>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
