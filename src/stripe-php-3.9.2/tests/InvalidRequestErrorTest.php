<?php

namespace Stripe;

class InvalidRequestErrorTest extends TestCase
{
    public function testInvalidObject()
    {
        self::authorizeFromEnv();
        try {
            Customer::retrieve('invalid');
        } catch (Error\InvalidRequest $e) {
            $this->assertSame(404, $e->getHttpStatus());
        }
    }

    public function testBadData()
    {
        self::authorizeFromEnv();
        try {
            Charge::create();
        } catch (Error\InvalidRequest $e) {
            $this->assertSame(400, $e->getHttpStatus());
        }
    }
}
