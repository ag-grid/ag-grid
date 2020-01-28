<?php
$pageTitle = "ag-Grid: Overview of the 63 Features";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. Version 16 has just been released adding to our extensive feature set. This page presents an overview of all features, you can click in for more detail and also determine whether available in the Free or Enterprise version.";
$pageKeyboards = "ag-Grid Features";
$pageGroup = "feature";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>

    <h1 id="features" class="first-h1">
        Features Overview
    </h1>

    <p>
        This section of the documentation describes each feature with a quick video of how it works. You can then click through
        to read the detailed article on how that feature works. The examples in the features section are provided in plain JavaScript.
        This demonstrates which properties to use and the relevant API call that is needed for
        each feature. To use in your framework of choice, you will apply the property
        or call the API in the way specific to your framework.
    </p>

    <note>
        All features that are only available in ag-Grid Enterprise are marked with the enterprise symbol <span class="enterprise-icon">e</span>
    </note>

<?php
$featuresRoot = '.';
include './gridFeatures.php';
?>



<?php include '../documentation-main/documentation_footer.php';?>