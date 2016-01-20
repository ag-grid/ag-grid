<!DOCTYPE html>
<html style="height: 100%;">

    <head>
        <title>ag-Grid Angular Example</title>
        <meta name="description" content="AngularJS Grid Example">
        <meta name="keywords" content="angular angularjs grid table example"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <!-- Bootstrap -->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">
        <link rel="stylesheet" href="./style.css">

        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>

        <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">

        <link rel="shortcut icon" href="http://www.ag-grid.com/favicon.ico" />

        <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular.min.js"></script>

        <script src="./dist/ag-grid.js?ignore=notused16"></script>
        <link rel="stylesheet" type="text/css" href="./dist/ag-grid.css?ignore=notused16">
        <link rel="stylesheet" type="text/css" href="./dist/theme-fresh.css?ignore=notused16">
        <link rel="stylesheet" type="text/css" href="./dist/theme-dark.css?ignore=notused16">
        <link rel="stylesheet" type="text/css" href="./dist/theme-blue.css?ignore=notused16">

        <script src="example.js"></script>

        <style>
            label {
                font-weight: normal !important;
            }

            .blue {
                background-color: darkblue;
                color: lightblue;
            }

            .good-score {
                background-color: lightgreen;
                /*color: lightblue;*/
            }

            .bad-score {
                background-color: lightcoral;
                /*color: lightblue;*/
            }

        </style>
    </head>

    <body ng-app="agGridApp" ng-controller="mainController" style="height: 100%; margin: 0px; padding: 0px;">

        <div style="position: absolute; top: 55px; left: 0px; padding: 0px 20px 20px 20px;">

            <nav class="navbar-inverse navbar-fixed-top">
                <div class="container">
                    <div class="row">
                        <div class="col-md-12 top-header big-text">
                        <span class="top-button-wrapper">
                            <a class="top-button" href="/"> <i class="fa fa-home"></i> Home</a>
                        </span>
                        <span class="top-button-wrapper">
                            <a class="top-button-selected" href="/example.php"> <i class="fa fa-bicycle"></i> Test Drive</a>
                        </span>
                        <span class="top-button-wrapper">
                            <a class="top-button" href="/documentation.php">  <i class="fa fa-book"></i> Documentation</a>
                        </span>
                        <span class="top-button-wrapper">
                            <a class="top-button" href="/media.php"> <i class="fa fa-road"></i> Media</a>
                        </span>
                        <span class="top-button-wrapper">
                            <a class="top-button" href="/forum"> <i class="fa fa-users"></i> Forum</a>
                        </span>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- First row of header, has table options -->
            <div style="padding: 4px;">
                <input placeholder="Filter..." type="text" ng-model="gridOptions.quickFilterText"/>

                <span style="padding-left: 20px;">Data Size:</span>
                <select ng-model="dataSize" ng-change="onDataSizeChanged()">
                    <option value="10x22">10,000 Rows, 22 Cols</option>
                    <option value="10x100">10,000 Rows, 100 Cols</option>
                    <option value="100x22">100,000 Rows, 22 Cols</option>
                </select>

                <span style="padding-left: 20px;">Theme:</span>

                <select ng-model="style" style="width: 90px;">
                    <option value="">-none-</option>
                    <option value="ag-fresh">Fresh</option>
                    <option value="ag-blue">Blue</option>
                    <option value="ag-dark">Dark</option>
                </select>

                <span style="padding-left: 20px; display: inline-block;">
                    <button ng-click="toggleToolPanel()">Tool Panel</button>
                </span>

            </div>
        </div>
        <!-- The table div -->
        <div style="padding: 100px 20px 20px 20px; height: 100%; box-sizing: border-box;">
            <div ag-grid="gridOptions" style="height: 100%;" ng-class="style"></div>
        </div>
    </body>

    <?php include_once("analytics.php"); ?>

</html>