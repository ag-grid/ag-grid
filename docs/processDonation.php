<?php

require_once('stripe-php-3.6.0/init.php');
require_once('stripeKey.php');

$token = json_decode(file_get_contents('php://input'));
$tokenId = $token->id;

try {
    \Stripe\Charge::create(array(
        "amount" => 35000,
        "currency" => "gbp",
        "card" => $tokenId
    ));
    $result = 'Success';
}
catch (Exception $e) {
    $result = $e->getMessage();
}
print($result);

?>