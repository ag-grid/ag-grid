<?php

namespace Stripe;

class ApplicationFeeTest extends TestCase
{
    public function testUrls()
    {
        $applicationFee = new ApplicationFee('abcd/efgh');
        $this->assertSame(
            $applicationFee->instanceUrl(),
            '/v1/application_fees/abcd%2Fefgh'
        );
    }

    public function testList()
    {
        self::authorizeFromEnv();
        $d = ApplicationFee::all();
        $this->assertSame($d->url, '/v1/application_fees');
    }
}
