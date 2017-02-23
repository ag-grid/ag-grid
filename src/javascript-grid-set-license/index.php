<?php
$key = "License Key";
$pageTitle = "ag-Grid JavaScript Data Grid Set License Key";
$pageDescription = "How to set the License Key in ag-Grid Enterprise";
$pageKeyboards = "ag-Grid JavaScript Data Grid Excel License Key";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2><img src="../images/enterprise_50.png" title="Enterprise Feature"/> Set License</h2>

    <p>
        Set the license key via the JavaScript method as described below.
        ag-Grid checks the license key without making any network calls.
        The license key is set once for the grid library. You do not need to set the license key for each instance of
        ag-Grid that you create. You must set the license key before you create an instance of ag-Grid.
    </p>

    <h4>JavaScript</h4>

    <p>
        Use this if you are using the Webpack bundled version of ag-Grid (eg you are using <i>ag-grid-enterprise.js</i>).
    </p>
    <pre>agGrid.LicenseManager.setLicenseKey("your license key");</pre>

    <h4>CommonJS</h4>
    <p>Use this if you are using CommonJS to load ag-Grid.</p>
    <pre>var enterprise = require("ag-grid-enterprise");
enterprise.LicenseManager.setLicenseKey("your license key");</pre>

    <h4>ECMA 6</h4>
    <p>Use this if you are using ECMA 6 imports to load ag-Grid.</p>
    <pre>import {LicenseManager} from "ag-grid-enterprise/main";
LicenseManager.setLicenseKey("your license key");</pre>

    <h3>Do Not Mix Loading Mechanisms</h3>

    <p>
        If you mix the methods above (eg if you are using CommonJS in your application, but use the JavaScript approach
        above to set license key) then it will not work. This is because the ag-Grid library will be loaded twice,
        one will have the license key and the other will be used in your application without the license key.
    </p>


    <h3>Note on Aurelia</h3>

    <p>
        For Aurelia users, we suggest you set your License Key in the <code>configure</code> function, as follows:
    <pre>
export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .plugin('ag-grid-aurelia')
    .feature('resources');

  // enterprise uncomment and set licence key here
  // LicenseManager.setLicenseKey('LICENSE KEY');

  ...rest of function</pre>

    <note>
        If you are distributing your product and including ag-Grid Enterprise, we realise that your license key will be
        visible to others. We appreciate that this is happening and just ask that you don't advertise it. Given our
        product is JavaScript, there is little we can do to prevent this.
    </note>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
