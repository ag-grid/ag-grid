<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <title>ag-Grid Online Payments</title>
    <meta name="description" content="License and Pricing details for ag-Grid">
    <meta name="keywords" content="ag-Grid Javascript Grid License and Pricing"/>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">

    <link rel="stylesheet" type="text/css" href="/style.css">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico" />

    <!-- Needed -->
    <script src="https://checkout.stripe.com/checkout.js"></script>

</head>

<body ng-app="index" class="big-text">

<?php $navKey = ""; include 'navbar.php'; ?>

<?php $headerTitle = "Online Payments"; include 'headerRow.php'; ?>

<div class="container info-page">

    <!-- after payment:

    -> store info in database
    -> send email to client
    -> send email to me

    -->

    <div class="row">
        <div class="col-md-6">

            <div id="form">

                <div class="form-group">
                    <label for="email">Customer Number:</label>
                    <input type="email" class="form-control" id="email">
                </div>

                <div class="checkbox">
                    <label for="amount">Amount (in GBP):</label>
                    <input type="amount" class="form-control" id="email">
                </div>

                <button class="btn btn-default" onclick="processPayment()">Continue</button>

            </div>

            <!-- pk_test_XfAfAZ2N9NiN1hSIRLxiYzws  -->

            <div id="donationStatus" style="padding-bottom: 50px;"></div>
<!--
            <button onclick="processPayment()">Pay £250</button>-->

            <script>
                function processPayment() {

                    var handler = StripeCheckout.configure({
                        key: 'pk_test_XfAfAZ2N9NiN1hSIRLxiYzws',
                        image: 'https://s3.amazonaws.com/stripe-uploads/acct_17VzvRHRly2dqCXJmerchant-icon-1453711346095-ag-Grid2-200.png',
                        locale: 'auto',
                        token: processStripeToken
                    });

                    // Open Checkout with further options
                    handler.open({
                        name: 'ag-Grid-Enterprise',
                        description: 'License',
                        currency: "GBP",
                        amount: 25000
                    });

                    function createBlock() {
                        var eDonationStatus = document.querySelector('#donationStatus');
                        var eBlock = document.createElement('div');
                        eBlock.innerHTML = '';
                        eBlock.style.border = '1px solid darkgrey';
                        eBlock.style.borderRadius = '5px';
                        eBlock.style.padding = '10px';
                        eBlock.style.margin = '10px';
                        eDonationStatus.appendChild(eBlock);
                        return eBlock;
                    }

                    function processStripeToken(token) {
                        var eNewStatus = createBlock();
                        eNewStatus.innerHTML = '>> Processing <<';

                        var request = new XMLHttpRequest();
                        request.onload = function () {
                            var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                            var data = request.responseText;
                            eNewStatus.innerHTML = 'Payment response (' + status + '): - ' + data;

                            if (data==='Success') {
                                setTimeout(function() {
                                    var eMessage = createBlock();
                                    eMessage.innerHTML = 'Your payment of £250 USD has been received. Thank you very much.';
                                }, 1000);
                            }
                        };

                        var bodyJson = JSON.stringify(token);
                        request.open('POST', 'processPayment.php?asdf=asf');
                        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                        request.send(bodyJson);
                    }
                }

            </script>

        </div>
    </div>

</div>

<?php include("footer.php"); ?>

</body>

<?php include_once("analytics.php"); ?>

</html>