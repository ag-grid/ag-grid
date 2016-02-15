
<?php
$key = "Donate";
$pageTitle = "ag-Grid Donate";
$pageDescription = "Donate to ag-Grid.";
$pageKeyboards = "Donate to ag-Grid";
include './documentation_header.php';
?>

<script src="https://checkout.stripe.com/checkout.js"></script>

<div>

    <h2>Donate</h2>

    <div style="padding-top: 10px; color: #111;">
        Please click this button to donate $500 USD to ag-Grid.
    </div>
    <div style="padding-top: 10px; padding-bottom: 10px;">
        <button onclick="processDonation()">Donate $500</button>
    </div>

    <!-- test -->
    <!-- pk_test_XfAfAZ2N9NiN1hSIRLxiYzws -->

    <!-- live -->
    <!-- pk_live_3WmNTMWDXx4qkE7hs70SyOHj -->

    <div id="donationStatus" style="padding-bottom: 50px;"></div>

    <script>
        function processDonation() {

            var handler = StripeCheckout.configure({
                key: 'pk_live_3WmNTMWDXx4qkE7hs70SyOHj',
                image: 'https://s3.amazonaws.com/stripe-uploads/acct_17VzvRHRly2dqCXJmerchant-icon-1453711346095-ag-Grid2-200.png',
                locale: 'auto',
                token: processStripeToken
            });

            // Open Checkout with further options
            handler.open({
                name: 'ag-Grid',
                description: 'Donation',
                currency: "usd",
                amount: 50000
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
                            eMessage.innerHTML = 'Your payment of $500 USD has been received. Thank you very much.';
                        }, 1000);
                    }
                };

                var bodyJson = JSON.stringify(token);
                request.open('POST', 'processDonation.php?asdf=asf');
                request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                request.send(bodyJson);
            }
        }

    </script>

</div>

<?php include './documentation_footer.php';?>


