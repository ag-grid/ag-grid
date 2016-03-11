<?php

require_once('stripe-php-3.9.2/init.php');
require_once 'PHPMailer-5.2.14/PHPMailerAutoload.php';
//require_once('stripeKey.php');

$token = json_decode(file_get_contents('php://input'));
$tokenId = $token->id;

try {
    \Stripe\Charge::create(array(
        "amount" => 50000,
        "currency" => "usd",
        "card" => $tokenId
    ));
    $result = 'Success';
}
catch (Exception $e) {
    $result = $e->getMessage();
}

print($result);

$mail = new PHPMailer;

$mail->isSMTP();
$mail->Host = 'gator3120.hostgator.com';
$mail->SMTPAuth = true;
$mail->Username = 'accounts@ag-grid.com';
$mail->Password = '0872393174Aa';
$mail->Host = 'mail.ag-grid.com';
$mail->Port = 25;

$mail->setFrom('accounts@ag-grid.com', 'ag-Grid Accounts');
$mail->addAddress('niall.crosby@gmail.com', 'Niall Crosby');
$mail->addBCC('niall.crosby@gmail.com', 'Niall Crosby');
$mail->addReplyTo('accounts@ag-grid.com', 'ag-Grid Accounts');
$mail->isHTML(true);

$mail->Subject = 'Here is the subject';
$mail->Body    = 'This is the HTML message body <b>in bold!</b>';
$mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

if(!$mail->send()) {
    echo 'Message could not be sent.';
    echo 'Mailer Error: ' . $mail->ErrorInfo;
} else {
    echo 'Message has been sent';
}

?>