<?php

include_once './setupSecrets.php';
include_once './paymentsDao.php';

$json = file_get_contents("php://input");
$data = json_decode($json);

$dao = new PaymentsDao();
$account = $dao->getAccount($data->id,$data->email);

if ($account!==null) {
    echo json_encode($account);
}

?>