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
                How to Order
            </h2>

            <p>
                To order ag-Grid-Enterprise, please email <a href="mailto:accounts@ag-grid.com?Subject=Query" target="_top">accounts@ag-grid.com</a>
                with the following information:
                <ul>
                    <li>Company name</li>
                    <li>Company address</li>
                    <li>Company VAT number (EU only)</li>
                    <li>Number of licenses required (ie number of developers)</li>
                    <li>Email address to associate with your ag-Grid account</li>
                </ul>
                We will then get back to you with an invoice.
            </p>

            <h2>
                How to Pay
            </h2>

            <p>
                Once you receive an invoice, you will be registered with us to allow you to
                make payments. Payments can be done via our online payments system or via direct debit.
            </p>

            <p>
                <a href="payments/payments.php" class="bigLink">
                    Go to Online Payments
                </a>
            </p>

        </div>
    </div>

</div>

<?php include("footer.php"); ?>

</body>

<?php include_once("analytics.php"); ?>

</html>