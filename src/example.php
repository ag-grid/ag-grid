<!DOCTYPE html>
<html class="height-100">

    <head>
        <title>ag-Grid Data Grid Example</title>
        <meta name="description" content="Example of using ag-Grid demonstrating that it can work very fast with thousands of rows.">
        <meta name="keywords" content="react angular angularjs data grid example"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <!-- Bootstrap -->

        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">

<!--        <link rel="stylesheet" href="./bootstrap/bootstrap.min.css">
        <link rel="stylesheet" href="./bootstrap/bootstrap-theme.min.css">
-->
        <link rel="stylesheet" href="./style.css">

        <style>
            label { font-weight: normal !important; }
            .blue { background-color: darkblue; color: lightblue; }
            .good-score { background-color: #0a0; }
            .bad-score { background-color: lightcoral; }
        </style>


<!--        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>
-->
<!--        <script src="./bootstrap/jquery.min.js"></script>
        <script src="./bootstrap/bootstrap.min.js"></script>
-->
        <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">

        <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico" />

<!--        <script src="./dist/ag-grid.js?ignore=notused19"></script>-->
        <script src="./dist/ag-grid-enterprise.js?ignore=notused19"></script>

        <script src="example.js"></script>

    </head>

    <body class="no-user-select" style="height: 100%; margin: 0px; padding: 0px;">


        <!-- The table div -->
        <div style="padding: 5px; padding-top: 102px; height: 100%; width: 100%;">
            <div id="myGrid" style="height: 100%;" class="ag-fresh"></div>
        </div>

        <div class="header-row" style="position: fixed; top: 0px; left: 0px; width: 100%; padding-bottom: 0px;">

            <?php $navKey = "demo"; include 'includes/navbar.php'; ?>

            <div class="container">

                <div class="row">
                    <div class="col-md-12">

                        <div style="padding: 5px 5px 6px 5px;">

                            <!-- First row of header, has table options -->
                            <div style="padding: 4px;">
                                <input placeholder="Filter..." type="text"
                                       oninput="onFilterChanged(this.value)"
                                       ondblclick="filterDoubleClicked(event)"
                                       class="hide-when-small"
                                       style="color: #333;"
                                />

                                <span style="padding-left: 20px;">Data Size:</span>
                                <select onchange="onDataSizeChanged(this.value)"
                                        style="color: #333;">
                                    <option value="1x22">1,000 Rows, 22 Cols</option>
                                    <option value="10x100">10,000 Rows, 100 Cols</option>
                                    <option value="100x22">100,000 Rows, 22 Cols</option>
                                </select>

                                <span style="padding-left: 20px;" class="hide-when-small">Theme:</span>

                                <select onchange="onThemeChanged(this.value)" style="width: 90px; color: #333;" class="hide-when-small">
                                    <option value="">-none-</option>
                                    <option value="ag-fresh" selected>Fresh</option>
                                    <option value="ag-blue">Blue</option>
                                    <option value="ag-dark">Dark</option>
                                </select>

                                <span id="message" style="margin-left: 10px;">
                                    <i class="fa fa-spinner fa-spin"></i>
                                    <span id="messageText"></span>
                                </span>

                            </div>
                        </div>

                    </div>
                </div>

            </div>

        </div>

    </body>

    <?php include_once("includes/analytics.php"); ?>

</html>