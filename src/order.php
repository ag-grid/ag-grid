<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <title>ag-Grid Support</title>
    <meta name="description" content="Ordering and payments page for ag-Grid.">
    <meta name="keywords" content="ag-Grid Javascript Grid Order and Payments"/>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">

    <link rel="stylesheet" type="text/css" href="/style.css">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico" />

</head>

<body ng-app="index" class="big-text">

<?php $navKey = ""; include 'navbar.php'; ?>

<?php $headerTitle = "Order ag-Grid Enterprise"; include 'headerRow.php'; ?>

<div class="container info-page">

    <div class="row">
        <div class="col-md-12">

            <h2>
                Please Be Patient
            </h2>

            <p>
                The online ordering system for ag-Grid is currently been developed. So we are going to
                have to do things manually.
            </p>

            <p>
                To order ag-Grid-Enterprise, please email <a href="mailto:accounts@ag-grid.com?Subject=Query" target="_top">accounts@ag-grid.com</a>
                with the following information:
                <ul>
                    <li>Company name</li>
                    <li>Country your company is registered</li>
                    <li>Company VAT number</li>
                    <li>Number of licenses required (ie number of developers)</li>
                    <li>Your email address (this will be used for all ag-Grid going forward)</li>
                    <li>ag-Grid forum username (we will then grant your forum user access to the members only forum)</li>
                </ul>
                We will then get back to you with an invoice. You will have the choice to settle the invoice via
                bank transfer or use our online payments system when it is ready.
            </p>

        </div>
    </div>

</div>

<?php include("footer.php"); ?>

</body>

<?php include_once("analytics.php"); ?>

</html>