<?php
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
        This section of the documentation describes each feature with a quick video of how it works. You can then click through
        to read the detailed article on how that feature works. The examples in the features section are provided in plain JavaScript.
        This demonstrates which properties to use and the relevant API call that is needed for
        each feature. To use in your framework of choice, you will apply the property
        or call the API in the way specific to your framework.
    </p>

    <h3 id="examples">ag-Grid Free vs ag-Grid Enterprise</h3>

    <p>
        All features that are only available in ag-Grid Enterprise are marked with the enterprise symbol:
        <img style="padding: 5px; border: 1px solid lightgrey;" src="../images/enterprise.png"/>
    </p>



    <?php
        $featuresRoot = '.';
        include './gridFeatures.php';
    ?>

</div>

<?php include '../documentation-main/documentation_footer.php';?>