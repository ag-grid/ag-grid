<?php

namespace Stripe;

class TransferReversalTest extends TestCase
{

    public function testList()
    {
        $transfer = self::createTestTransfer();
        $all = $transfer->reversals->all();
        $this->assertSame(false, $all['has_more']);
        $this->assertSame(0, count($all->data));
    }
}
