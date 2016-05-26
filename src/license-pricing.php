<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <title>ag-Grid License and Pricing</title>
    <meta name="description" content="License and Pricing details for ag-Grid">
    <meta name="keywords" content="ag-Grid Javascript Grid License and Pricing"/>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">

    <link rel="stylesheet" type="text/css" href="/style.css">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico" />

</head>

<body ng-app="index" class="big-text">

<?php $navKey = "licenseAndPricing"; include 'includes/navbar.php'; ?>

<?php $headerTitle = "License and Pricing"; include 'includes/headerRow.php'; ?>

<div class="container info-page">

    <style>
        .theTable {
            text-align: center;
        }
        .tableCell {
            width: 48%;
            border-left: 1px solid #888;
            border-right: 1px solid #888;
            padding: 10px;
        }
        .tableHighlightCell {
            border-top: 1px solid #888;
            border-bottom: 1px solid #888;
            background-color: #eee;
        }
        .gapCol {
            width: 4%;
        }
        .titleCell {
            font-weight: bold;
            font-family: Impact, Charcoal, sans-serif;
            font-size: 35px;
            background-color: #eee;
            border-top: 1px solid #888;
            border-bottom: 1px solid #888;
        }
        .gridFeature {
            padding: 4px;
        }
        .gridFeaturesTitle {
            /*background-color: #eee;*/
            font-weight: bold;
        }
        .gridFeaturePlus {
            font-weight: bold;
        }
        .gridFeaturesList {
            /*background-color: #eee;*/
        }
        .benefitsCell {
            border-bottom: 1px solid #888;
        }
    </style>

    <div class="row">
        <div class="col-md-12">

            <h2>
                Choosing a License
            </h2>

            <p>
                ag-Grid free edition comes with standard features and is released under MIT. There is no warranty or support.
                ag-Grid-Enterprise comes with a commercial license, extra enterprise features, support and maintenance. If you want
                to use ag-Grid-Enterprise, you must purchase an ag-Grid-Enterprise license.
            </p>
        </div>
    </div>

    <div class="row">
        <div class="col-md-12">

            <h2>
                Enterprise Evaluation License
            </h2>

            <p>
                An evaluation license for ag-Grid-Enterprise is granted to anyone wishing evaluate ag-Grid-Enterprise.
                All we ask in return is the following:
            <ul>
                <li>
                    You agree to use the Evaluation License only for evaluation of ag-Grid-Enterprise. You do not enter production with ag-Grid-Enterprise.
                </li>
                <li>
                    You limit your trial to two months (after that, either uninstall or purchase).
                </li>
                <li>
                    You get in touch (<a href="mailto:accounts@ag-grid.com?Subject=Query" target="_top">accounts@ag-grid.com</a>)
                    and inform us you are taking a trial.
                </li>
            </ul>
            </p>
        </div>
    </div>

<!--    <div class="row">
        <div class="col-md-12">

            <h2>
                Enterprise Non-Commercial License
            </h2>

            <p>
                If you wish to use ag-Grid-Enterprise within a non-profit charity or for educational purposes,
                then you can use ag-Grid-Enterprise for free. All we ask in return is the following:
                <ul>
                    <li>
                        If you are hosting ag-Grid-Enterprise on a website, you provide a link back to the ag-Grid website.
                    </li>
                    <li>
                        You do not alter any of the copyright headers in the javascript files.
                    </li>
                    <li>
                        Your users are aware that ag-Grid-Enterprise is not free for commercial use.
                    </li>
                    <li>
                        You get in touch (<a href="mailto:accounts@ag-grid.com?Subject=Query" target="_top">accounts@ag-grid.com</a>)
                        and inform us you are using ag-Grid-Enterprise for non-commercial use.
                    </li>
                </ul>
                The non-commercial license is for using ag-Grid-Enterprise only. It does not cover any warranty or support.
            </p>
        </div>
    </div>
-->
    <div class="row">
        <div class="col-md-12">

            <h2>
                Free vs Enterprise Comparison and Pricing
            </h2>

            <table class="theTable" style="width: 100%;">
                <tr>
                    <td class="titleCell tableHighlightCell tableCell">
                        <span style="color: darkred; ">ag</span><span style="color: #404040">-Grid</span>
                    </td>
                    <td class="gapCol"/>
                    <td class="titleCell tableHighlightCell tableCell">
                        <span style="color: darkred; ">ag</span><span style="color: #404040">-Grid-Enterprise</span>
                    </td>
                </tr>

                <tr>
                    <td class="titlePrice tableCell">
                        <div style="font-size: 20px; font-weight: bold;">
                            Free
                        </div>
                    </td>
                    <td class="gapCol"/>
                    <td class="titlePrice tableCell">
                        <div style="font-size: 20px; font-weight: bold;">
                            £350
                        </div>
                        <div>
                            / Developer per Application
                        </div>
                        <div style="padding-top: 10px;">
                            All License Perpetual
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="titlePrice tableCell">
                        Best for open source projects & hobbyists
                    </td>
                    <td class="gapCol"/>
                    <td class="titlePrice tableCell">
                        Best for professional developers building enterprise applications
                    </td>
                </tr>

                <tr>
                    <td class="tableHighlightCell tableCell">
                        Released under <a href="https://github.com/ceolter/ag-grid/blob/master/LICENSE.txt">MIT</a>
                    </td>
                    <td class="gapCol"/>
                    <td class="tableHighlightCell tableCell">
                        Released under <a href="https://github.com/ceolter/ag-grid-enterprise/blob/master/LICENSE.md">Commercial License</a>
                    </td>
                </tr>

                <tr>
                    <td class="benefitsCell tableCell">

                        <div class="gridFeaturesTitle">
                            Standard ag-Grid Features:
                        </div>
                        <div class="gridFeaturesList">

                            <ul class="diamond-separated-list">
                                <li>Column Pinning Left & Right</li>
                                <li>Column Resizing</li>
                                <li>Column Auto-Size to Fit Contents</li>
                                <li>Variable Row Height</li>
                                <li>Tree Data</li>
                                <li>Data CSV Export</li>
                                <li>In Grid Sorting</li>
                                <li>Server Side Sorting</li>
                                <li>In Grid Filtering</li>
                                <li>Server Side Filtering</li>
                                <li>Data Editing</li>
                                <li>Keyboard Navigation</li>
                                <li>Quick Search</li>
                                <li>Column Grouping</li>
                                <li>Row Selection</li>
                                <li>Checkbox Selection</li>
                                <li>Grid Data Context</li>
                                <li>Value Getters</li>
                                <li>Expressions</li>
                                <li>Cell Styling</li>
                                <li>CSS Themes</li>
                                <li>Custom Rendering</li>
                                <li>Frozen / Floating Rows</li>
                                <li>Multi Level Header Grouping</li>
                                <li>Header Templates</li>
                                <li>Events</li>
                                <li>Internationalisation</li>
                                <li>Cross Browser</li>
                                <li>Printable</li>
                                <li>Grid API</li>
                                <li>Sorting API</li>
                                <li>Filtering API</li>
                                <li>Column API</li>
                                <li>Pagination</li>
                                <li>Infinite Scrolling</li>
                                <li>Floating Footers</li>
                                <li>Master / Slave</li>
                            </ul>

                        </div>

                        <div class="gridFeaturePlus">Plus</div>

                        <div class="gridFeature">Get help via Stack Overflow</div>

                    </td>
                    <td class="gapCol"/>
                    <td class="benefitsCell tableCell">

                        <div class="gridFeaturesTitle">
                            All Standard Features Plus:
                        </div>
                        <div class="gridFeaturesList">
                            <ul class="diamond-separated-list">
                                <li>Grouping and Aggregation of Data</li>
                                <li>Excel-like Filtering</li>
                                <li>Advanced Column Menu</li>
                                <li>Context Menu</li>
                                <li>Cell Range Selection</li>
                                <li>Status Panel with Aggregation</li>
                                <li>Clipboard Copy & Paste</li>
                                <li>Tool Panel for Column Management</li>
                            </ul>
                        </div>

                        <div class="gridFeaturePlus">Plus</div>

                        <div class="gridFeature">
                            Upgrades for 1 Year
                        </div>

                        <div class="gridFeaturePlus">Plus</div>

                        <div class="gridFeature">
                            Online Support for 1 Year
                        </div>

                        <div class="gridFeaturePlus">Plus</div>

                        <div class="gridFeature">
                            Raise Bugs and Feature Requests
                        </div>

                        <div class="gridFeaturePlus">Plus</div>

                        <div class="gridFeature">
                            Influence the Future Direction of ag-Grid
                        </div>

                    </td>
                </tr>

                <tr>
                    <td class="tableHighlightCell tableCell">
                        Download for Free
                    </td>
                    <td class="gapCol"/>
                    <td class="tableHighlightCell tableCell">

                        <a href="order.php" class="btn btn-primary btn-large bigLink">
                            Continue to Ordering
                        </a>

                    </td>
                </tr>
            </table>

        </div>
    </div>

    <div class="row">
        <div class="col-md-12" style="text-align: center; padding: 40px;">
            Still don't know which version you want? Then go for ag-Grid Enterprise, your contribution
            back will help ag-Grid grow into the future.
        </div>
    </div>

    <div class="row">
        <div class="col-md-12" style="text-align: center;">
            Any questions on licensing or ordering? Email <a href="mailto:accounts@ag-grid.com?Subject=Query" target="_top">accounts@ag-grid.com</a>
        </div>
    </div>

    <div class="row">
        <div class="col-md-12">

            <h2>
                Enterprise Perpetual, Support and Upgrades
            </h2>

            <p>
                The perpetual nature of the enterprise license means you can continue to use the version of
                ag-Grid Enterprise, plus any release for one year, indefinitely. There is no requirement to
                pay again to continue using the software.
            </p>

        </div>
    </div>

    <div class="row">
        <div class="col-md-12">

            <h2>
                Enterprise Bulk / Site Licenses
            </h2>

            <p>
                We provide pricing for bulk and / or site license. Pricing availabe on request.
            </p>

        </div>
    </div>

    <div class="row">
        <div class="col-md-12">

            <h2>
                Enterprise OEM and SAAS License
            </h2>

            <p>
                We provide license for OEM and SAAS. Pricing availabe on request.
            </p>

        </div>
    </div>

</div>

<?php include("includes/footer.php"); ?>

</body>

<?php include_once("includes/analytics.php"); ?>

</html>