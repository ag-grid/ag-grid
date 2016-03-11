<?php

namespace Stripe;

class RefundTest extends TestCase
{

    public function testCreate()
    {
        $charge = self::createTestCharge();
        $refund = Refund::create(array('amount' => 100, 'charge' => $charge->id));
        $this->assertSame(100, $refund->amount);
        $this->assertSame($charge->id, $refund->charge);
    }

    public function testUpdateAndRetrieve()
    {
        $charge = self::createTestCharge();
        $ref = Refund::create(array('amount' => 100, 'charge' => $charge->id));
        $ref->metadata["key"] = "value";
        $ref->save();
        $ref = Refund::retrieve($ref->id);
        $this->assertSame("value", $ref->metadata["key"], "value");
    }

    public function testListForCharge()
    {
        $charge = self::createTestCharge();
        $refA = Refund::create(array('amount' => 100, 'charge' => $charge->id));
        $refB = Refund::create(array('amount' => 50, 'charge' => $charge->id));

        $all = Refund::all(array('charge' => $charge));
        $this->assertSame(false, $all['has_more']);
        $this->assertSame(2, count($all->data));
        $this->assertSame($refB->id, $all->data[0]->id);
        $this->assertSame($refA->id, $all->data[1]->id);
    }

    public function testList()
    {
        $all = Refund::all();

        // Fetches all refunds on this test account.
        $this->assertSame(true, $all['has_more']);
        $this->assertSame(10, count($all->data));
    }

    public function testCreateForBitcoin()
    {
        self::authorizeFromEnv();

        $receiver = $this->createTestBitcoinReceiver("do+fill_now@stripe.com");

        $charge = Charge::create(
            array(
                'amount' => $receiver->amount,
                'currency' => $receiver->currency,
                'description' => $receiver->description,
                'source' => $receiver->id
            )
        );

        $ref = Refund::create(
            array(
                'amount' => $receiver->amount,
                'refund_address' => 'ABCDEF',
                'charge' => $charge->id
            )
        );
        $this->assertSame($receiver->amount, $ref->amount);
        $this->assertNotNull($ref->id);
    }

    // Deprecated charge endpoints:

    public function testCreateViaCharge()
    {
        $charge = self::createTestCharge();
        $ref = $charge->refunds->create(array('amount' => 100));
        $this->assertSame(100, $ref->amount);
        $this->assertSame($charge->id, $ref->charge);
    }

    public function testUpdateAndRetrieveViaCharge()
    {
        $charge = self::createTestCharge();
        $ref = $charge->refunds->create(array('amount' => 100));
        $ref->metadata["key"] = "value";
        $ref->save();
        $ref = $charge->refunds->retrieve($ref->id);
        $this->assertSame("value", $ref->metadata["key"], "value");
    }

    public function testListViaCharge()
    {
        $charge = self::createTestCharge();
        $refA = $charge->refunds->create(array('amount' => 50));
        $refB = $charge->refunds->create(array('amount' => 50));

        $all = $charge->refunds->all();
        $this->assertSame(false, $all['has_more']);
        $this->assertSame(2, count($all->data));
        $this->assertSame($refB->id, $all->data[0]->id);
        $this->assertSame($refA->id, $all->data[1]->id);
    }

    public function testCreateForBitcoinViaCharge()
    {
        self::authorizeFromEnv();

        $receiver = $this->createTestBitcoinReceiver("do+fill_now@stripe.com");

        $charge = Charge::create(
            array(
                'amount' => $receiver->amount,
                'currency' => $receiver->currency,
                'description' => $receiver->description,
                'source' => $receiver->id
            )
        );

        $ref = $charge->refunds->create(
            array(
                'amount' => $receiver->amount,
                'refund_address' => 'ABCDEF'
            )
        );
        $this->assertSame($receiver->amount, $ref->amount);
        $this->assertNotNull($ref->id);
    }
}
