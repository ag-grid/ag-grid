<?php

namespace Stripe;

class BalanceTest extends TestCase
{
    public function testRetrieve()
    {
        self::authorizeFromEnv();
        $d = Balance::retrieve();
        $this->assertSame($d->object, "balance");
        $this->assertTrue(Util\Util::isList($d->available));
        $this->assertTrue(Util\Util::isList($d->pending));
    }
}
