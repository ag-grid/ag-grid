<?php

namespace Stripe;

class BalanceTransactionTest extends TestCase
{
    public function testList()
    {
        self::authorizeFromEnv();
        $d = BalanceTransaction::all();
        $this->assertSame($d->url, '/v1/balance/history');
    }
}
