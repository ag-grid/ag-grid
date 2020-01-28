<?php
$pageTitle = "ag-Grid Supported Browsers";
$pageDescription = "It would be great to support all versions of all browsers in the world, but we have to be realistic and practical. The browsers we officially support are details on this page.";
$pageKeyboards = "ag-Grid Supported Browsers";
$pageGroup = "reference";
include '../documentation-main/documentation_header.php';
?>

<h1>Supported Browsers</h1>

<p class="lead">
    All modules of ag-Grid (Community, Enterprise and Charts) are tested to work with a wide array of browsers
    and operating systems.
</p>

<p>
    We test against all the browser below. However we also work with other less common browsers by default.
    If the browsers / platform you are using is not listed below (eg Opera on Android) then we suggest testing
    the version of the grid you are interested in and making the decision for yourself. ag-Grid is
    primarily concerned with supporting all common desktop and mobile browsers.
</p>

<h2>Desktop Browsers</h2>

<p>
    The officially supported desktop browsers are as follows:
</p>

<style>


    .icon-and-title {
        text-align: center;
    }
    .browser-icon {
        width: 80px;
    }
    .browser-row {
        margin-bottom: 20px;
    }
</style>

<table class="supported-browsers">
    <tr>
        <th>Browser</th>
        <th>Supported Version</th>
    </tr>
    <tr class="browser-row">
        <td>
            <div class="icon-and-title">
                Chrome
                <br/>
                <img class="browser-icon" src="../_assets/browsers/chrome.svg"/>
            </div>
        </td>
        <td>
            Two latest versions.
        </td>
    </tr>
    <tr class="browser-row">
        <td>
            <div class="icon-and-title">
                Firefox
                <br/>
                <img class="browser-icon" src="../_assets/browsers/firefox.svg"/>
            </div>
        </td>
        <td>
            Two latest versions.
        </td>
    </tr>
    <tr class="browser-row">
        <td>
            <div class="icon-and-title">
                Microsoft Edge
                <br/>
                <img class="browser-icon" src="../_assets/browsers/edge.svg"/>
            </div>
        </td>
        <td>
            Two latest versions.
        </td>
    </tr>
    <tr class="browser-row">
        <td>
            <div class="icon-and-title">
                Internet Explorer
                <br/>
                <img class="browser-icon" src="../_assets/browsers/internet_explorer.png"/>
            </div>
        </td>
        <td>
            Version 11
        </td>
    </tr>
    <tr class="browser-row">
        <td>
            <div class="icon-and-title">
                Safari
                <br/>
                <img class="browser-icon" src="../_assets/browsers/safari_256x256.png"/>
            </div>
        </td>
        <td>
            Two latest versions on OSX only (Microsoft Windows version not supported)
        </td>
    </tr>
</table>

<h2>Mobile Browsers</h2>

<p>
    The officially supported mobile browsers are as follows:
</p>

<table class="supported-browsers">
    <tr>
        <th>Browser</th>
        <th>Supported Version</th>
    </tr>
    <tr>
        <td>
            <div class="icon-and-title">
                Safari iOS
                <br/>
                <img class="browser-icon" src="../_assets/browsers/safari-ios.svg"/>
            </div>
        </td>
        <td>
            Two latest versions on iOS devices (iPad / iPhone) only.
        </td>
    </tr>
    <tr>
        <td>
            <div class="icon-and-title">
                Chrome
                <br/>
                <img class="browser-icon" src="../_assets/browsers/chrome.svg"/>
            </div>
        </td>
        <td>
            Two latest versions on iOS devices (iPad / iPhone) and Android devices (Android phones and tablets).
        </td>
    </tr>
</table>


<?php include '../documentation-main/documentation_footer.php';?>
