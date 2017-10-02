<?php
$key = "Features";
$pageTitle = "ag-Grid Features";
$pageDescription = "ag-Grid Features";
$pageKeyboards = "ag-Grid Features";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 id="features" class="first-h1">
        <img src="../images/svg/docs/features.svg" style="width: 50px; position: relative; top: -10px;"/>
        Features Overview
    </h1>

    <p>
        The features part of the documentation goes through all the features in detail
        along with examples.
    </p>

    <p>
        The examples in the features section are provided in plain JavaScript. You will see
        in the documentation section you will see what properties and API are needed for
        each feature. Then to use in your framework of choice, you will apply the property
        or call the API in the way specific to your framework.
    </p>

    <h2 id="examples">ag-Grid Free vs ag-Grid Enterprise</h2>

    <p>
        All features that are only availabe in ag-Grid Enterprise are marked with the enterprise symbol:
        <img style="padding: 5px; border: 1px solid lightgrey;" src="../images/enterprise.png"/>
    </p>

    <p>
        When you see this symbol, the feature is only available in ag-Grid Enterprise.
    </p>

    <div style="margin-top: 50px; margin-bottom: 30px; text-align: center;">
        <h1>Feature Roadshow</h1>
    </div>


    <?php include './gridFeatures.php';?>

</div>

<?php include '../documentation-main/documentation_footer.php';?>