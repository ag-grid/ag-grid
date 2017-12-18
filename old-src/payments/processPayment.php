<?php

require_once '../stripe-php-3.9.2/init.php';
require_once '../PHPMailer-5.2.14/PHPMailerAutoload.php';

require_once './setupSecrets.php';

global $email_password;

class ProcessPaymentResult {
    public $success;
    public $message;
}

$result = new ProcessPaymentResult();

// STEP 1 - do stripe payment
$data = json_decode(file_get_contents('php://input'));
$account = $data->account;
$token = $data->token;

try {
    \Stripe\Charge::create(array(
        "amount" => $account->amount * 100,
        "currency" => "gbp",
        "card" => $token->id
    ));
    $result->success = true;
} catch (Exception $e) {
    $result->success = false;
    $result->message = $e->getMessage();
}

echo json_encode($result);

if ($result->success) {

    // STEP 2 - send emails
    $mail = new PHPMailer;

    $mail->isSMTP();
    $mail->Host = 'gator3120.hostgator.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'accounts@ag-grid.com';
    $mail->Password = $email_password;
    $mail->Host = 'mail.ag-grid.com';
    $mail->Port = 25;

    $mail->setFrom('accounts@ag-grid.com', 'ag-Grid Accounts');
    $mail->addAddress($account->email, $account->name);
    $mail->addBCC('accounts@ag-grid.com', 'ag-Grid Accounts');
    $mail->addReplyTo('accounts@ag-grid.com', 'ag-Grid Accounts');
    $mail->isHTML(true);

    $mail->Subject = 'ag-Grid Payment Received (account '.$account->id.')';
    $mail->Body    = '<div style="padding: 20px;">Your payment of £'.$account->amount.' to account '.$account->id.' was received.</div><div style="padding: 20px;">Thank you for choosing ag-Grid.</div>';
    $mail->AltBody = 'Your payment of £'.$account->amount.' was received.';

    $mail->send();
}

?>