
var paymentsApp = angular.module('paymentsApp', []);

paymentsApp.directive("makePayment", function() {
    return {
        templateUrl: 'makePayment.html',
        controller: makePaymentController
    };
});

function makePaymentController($scope, $http) {

    $scope.showCustomerLookup = true;
    $scope.showTakePayment = false;

    $scope.lookupAccount = function() {
        $scope.showCustomerLoading = true;
        $http.post("getAccount.php",{id: $scope.id, email: $scope.email})
            .then(function(response) {
                $scope.showCustomerLoading = false;
                if (response.data && response.data.name) {
                    $scope.account = response.data;
                    $scope.showCustomerLookup = false;
                    $scope.showTakePayment = true;
                } else {
                    $scope.lookupAccountResult = 'Could not find customer for ' + $scope.id + ', ' + $scope.email;
                }
            });
    };

    $scope.makePayment= function() {

        var handler = StripeCheckout.configure({
            key: stripe_publishable_key,
            image: 'https://s3.amazonaws.com/stripe-uploads/acct_17VzvRHRly2dqCXJmerchant-icon-1453711346095-ag-Grid2-200.png',
            locale: 'auto',
            email: $scope.account.email,
            token: processStripeToken
        });

        // Open Checkout with further options
        handler.open({
            name: 'ag-Grid-Enterprise',
            description: 'License',
            currency: "GBP",
            amount: $scope.account.amount * 100
        });

        function processStripeToken(token) {
            $scope.showPaymentLoading = true;

            $http.post("processPayment.php", {account: $scope.account, token: token})
                .then(function(response) {

                    console.log(response.data);
                    $scope.showPaymentLoading = false;

                    if (response.data.success) {
                        $scope.showTakePayment = false;
                        $scope.showFinished = true;
                    } else {
                        $scope.paymentError = response.data.message;
                    }

                });
        }

    };
}
