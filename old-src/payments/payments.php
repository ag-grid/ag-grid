<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <title>ag-Grid Online Payments</title>
    <meta name="description" content="Payment portal for ag-Grid">
    <meta name="keywords" content="ag-Grid payment"/>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">

    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.9/angular.js"></script>

    <link rel="stylesheet" type="text/css" href="/style.css">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico" />

    <!-- javascript -->
    <script src="https://checkout.stripe.com/checkout.js"></script>
    <script src="./payments.js"></script>

</head>

<body class="big-text">

<?php
    $navKey = "";
    include '../includes/navbar.php';

    $headerTitle = "Online Payments";
    include '../includes/headerRow.php';

    include './setupSecrets.php';

    global $stripe_publishable_key;
?>

<script>
    var stripe_publishable_key = '<?=$stripe_publishable_key?>';
</script>

<div class="container info-page" ng-app="paymentsApp">

    <div class="row">
        <div class="col-md-12">

            <h2>
                Payments via Stripe.com
            </h2>

            <div style="float: right;">
                <img src="../images/poweredByStripe.png"/>
            </div>

            <p>
                ag-Grid uses Stripe.com for online payments. Your transaction is safe.
            </p>

        </div>
    </div>

    <div style="padding: 20px">
    </div>

    <make-payment></make-payment>

</div>


<?php include("../includes/footer.php"); ?>

</body>

<?php include_once("../includes/analytics.php"); ?>

</html>