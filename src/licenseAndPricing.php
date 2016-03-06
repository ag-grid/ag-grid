<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <title>ag-Grid Support</title>
    <meta name="description" content="ag-Grid comes either as free or as Enterprise with support. This page explains the different support models for the free and Enterprise versions of ag-Grid.">
    <meta name="keywords" content="ag-Grid Javascript Grid Support"/>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">

    <link rel="stylesheet" type="text/css" href="/style.css">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico" />

</head>

<body ng-app="index" class="big-text">

<?php $navKey = "licenseAndPricing"; include 'navbar.php'; ?>

<?php $headerTitle = "License and Pricing"; include 'headerRow.php'; ?>

<div class="container">

    <div class="row">
        <div class="col-md-12" style="text-align: center; padding: 40px; font-weight: bold;">
            Choose the edition that's right for you
        </div>
    </div>

    <style>
        .theTable {
        }
        .tableCell {
            width: 48%;
            border-left: 1px solid #ddd;
            border-right: 1px solid #ddd;
            padding: 10px;
        }
        .gapCol {
            width: 4%;
        }
        .titleCell {
            font-weight: bold;
            font-family: Impact, Charcoal, sans-serif;
            font-size: 35px;
            background-color: #eee;
        }
        .licenseCell {
            background-color: #eee;
        }
        .gridFeature {
            padding: 4px;
        }
        .benefitsCell {
            border-bottom: 1px solid #ddd;
        }
        .buyLink {
            background-color: lightgreen;
            padding: 4px;
            margin: 10px;
            display: inline-block;
            font-weight: bold;
            border-radius: 2px;
        }
    </style>

    <div class="row">
        <div class="col-md-12" style="text-align: center;">

            <table class="theTable" style="width: 100%;">
                <tr>
                    <td class="titleCell tableCell">
                        <span style="color: darkred; ">ag</span><span style="color: #404040">-Grid</span>
                    </td>
                    <td class="gapCol"/>
                    <td class="titleCell tableCell">
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
                            £250
                        </div>
                        <div>
                            / developer
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
                    <td class="licenseCell tableCell">
                        Released under <a href="https://github.com/ceolter/ag-grid/blob/master/LICENSE.txt">MIT</a>
                    </td>
                    <td class="gapCol"/>
                    <td class="licenseCell tableCell">
                        Released under <a href="https://github.com/ceolter/ag-grid-enterprise/blob/master/LICENSE.md">Commercial License</a>
                    </td>
                </tr>

                <tr>
                    <td class="benefitsCell tableCell">

                        <div class="gridFeature">Standard ag-Grid Features</div>

                        &diams;

                        <div class="gridFeature">Get help via Stack Overflow</div>

                    </td>
                    <td class="gapCol"/>
                    <td class="benefitsCell tableCell">
                        <div class="gridFeature">
                            All standard features plus the following enterprise features:<br/>
                            &bull; Grouping and Aggregation of Data<br/>
                            &bull; Excel-like Filtering<br/>
                            &bull; Context Menu<br/>
                            &bull; Advanced Column Menu<br/>
                            &bull; Tool Panel for Column Management<br/>
                            &bull; Cell Range Selection<br/>
                            &bull; Clipboard Interaction<br/>
                        </div>

                        &diams;

                        <div class="gridFeature">
                            Access to Support via Members Forum
                        </div>

                        &diams;

                        <div class="gridFeature">
                            Raise Bugs and Feature Requests
                        </div>

                        &diams;

                        <div class="gridFeature">
                            Influence the Future Direction of ag-Grid
                        </div>

                        <span class="buyLink">
                            Email <a href="mailto:accounts@ag-grid.com?Subject=Query" target="_top">accounts@ag-grid.com</a>
                        </span>

                    </td>
                </tr>
            </table>

        </div>
    </div>

    <div class="row">
        <div class="col-md-12" style="text-align: center; padding: 40px;">
            Still don't know which version you want? Then go for ag-Grid Enterprise, your contribution
            back will help ag-Grid healthy grow into the future.
        </div>
    </div>

</div>

<?php include("footer.php"); ?>

</body>

<?php include_once("analytics.php"); ?>

</html>