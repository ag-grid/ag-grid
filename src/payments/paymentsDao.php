<?php

require_once './setupSecrets.php';
require_once './account.php';

class PaymentsDao {

    function getAccount($id, $email) {
        global $mysqli;

        $stmt = $mysqli->prepare("SELECT name, amount FROM ceolter_portal.accounts where id = ? and email = ?");
        $stmt->bind_param('is', $id, $email);

        $stmt->execute();
        $stmt->bind_result($name, $amount);

        $result = NULL;

        while($stmt->fetch()) {
            $result = new Account;
            $result->name = $name;
            $result->id = $id;
            $result->email = $email;
            $result->amount = $amount;
        }

        $stmt->close();

        return $result;
    }

}

?>