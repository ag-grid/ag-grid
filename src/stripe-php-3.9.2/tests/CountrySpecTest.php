<?php

namespace Stripe;

class CountrySpecTest extends TestCase
{
    public function testRetrieve()
    {
        self::authorizeFromEnv();

        $country = "US";
        $d = CountrySpec::retrieve($country);
        $this->assertSame($d->object, "country_spec");
        $this->assertSame($d->id, $country);
        $this->assertGreaterThan(0, count($d->supported_bank_account_currencies));
        $this->assertGreaterThan(0, count($d->supported_payment_currencies));
        $this->assertGreaterThan(0, count($d->supported_payment_methods));
        $this->assertGreaterThan(0, count($d->verification_fields));
    }

    public function testList()
    {
        self::authorizeFromEnv();

        $d = CountrySpec::all();
        $this->assertSame($d->object, "list");
        $this->assertGreaterThan(0, count($d->data));
        $this->assertSame($d->data[0]->object, "country_spec");
        $this->assertInstanceOf("Stripe\\CountrySpec", $d->data[0]);
    }
}
