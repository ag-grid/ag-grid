<?php

require_once '../PHPMailer-5.2.14/PHPMailerAutoload.php';

require_once './setupSecrets.php';

global $email_password;

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
$mail->addAddress('accounts@ag-grid.com', 'ag-Grid Accounts');
$mail->addReplyTo('accounts@ag-grid.com', 'ag-Grid Accounts');
$mail->isHTML(true);

$mail->Subject = 'DUMMY_EMAIL';
$mail->Body    = '<div style="padding: 20px;">This is a dummy email.</div>';
$mail->AltBody = 'This is a dummy email.';

$mail->send();

?>