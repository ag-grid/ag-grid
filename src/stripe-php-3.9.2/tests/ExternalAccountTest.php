<?php

namespace Stripe;

class ExternalAccountTest extends TestCase
{
    public function testVerify()
    {
        self::authorizeFromEnv();
        $bankAccountToken = Token::create(
            array(
                'bank_account' => array(
                'country' => 'US',
                'routing_number' => '110000000',
                'account_number' => '000123456789',
                'account_holder_name' => 'Jane Austen',
                'account_holder_type' => 'company'
                )
            )
        );
        $customer = Customer::create();
        $externalAccount = $customer->sources->create(array('bank_account' => $bankAccountToken->id));
        $verifiedAccount = $externalAccount->verify(array('amounts' => array(32, 45)), null);

        $base = Customer::classUrl();
        $parentExtn = $externalAccount['customer'];
        $extn = $externalAccount['id'];
        $this->assertEquals("$base/$parentExtn/sources/$extn", $externalAccount->instanceUrl());
    }
}
