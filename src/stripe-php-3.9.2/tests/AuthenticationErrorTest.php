<?php

namespace Stripe;

class AuthenticationErrorTest extends TestCase
{
    public function testInvalidCredentials()
    {
        Stripe::setApiKey('invalid');
        try {
            Customer::create();
        } catch (Error\Authentication $e) {
            $this->assertSame(401, $e->getHttpStatus());
        }
    }
}
