<?php
$key = "Set License Key";
$pageTitle = "ag-Grid JavaScript Data Grid Set License Key";
$pageDescription = "How to set the License Key in ag-Grid Enterprise";
$pageKeyboards = "ag-Grid JavaScript Data Grid Excel License Key";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Set License</h2>

    <p>
        <?php include '../enterprise.php';?>
        &nbsp;
        Setting of License Key is required when using ag-Grid Enterprise.
    </p>

    <h3>Setting the License Key</h3>
    <p>The License Key is set via a static method - there are no server side checks involved.</p>

    <p>You can set the License Key via the following mechanisms, prior to initialising ag-Grid Enterprise:</p>

    <p>
        JavaScript:
        <pre>agGrid.LicenseManager.setLicenseKey("your license key");</pre>

        CommonJS:
        <pre>var enterprise = require("ag-grid-enterprise");<br/>enterprise.LicenseManager.setLicenseKey("your license key");</pre>
    </p>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
