<?php

namespace Stripe;

class BitcoinReceiverTest extends TestCase
{
    public function testUrls()
    {
        $classUrl = BitcoinReceiver::classUrl('Stripe_BitcoinReceiver');
        $this->assertSame($classUrl, '/v1/bitcoin/receivers');
        $receiver = new BitcoinReceiver('abcd/efgh');
        $instanceUrl = $receiver->instanceUrl();
        $this->assertSame($instanceUrl, '/v1/bitcoin/receivers/abcd%2Fefgh');
    }

    public function testCreate()
    {
        self::authorizeFromEnv();

        $receiver = $this->createTestBitcoinReceiver("do+fill_now@stripe.com");

        $this->assertSame(100, $receiver->amount);
        $this->assertNotNull($receiver->id);
    }

    public function testRetrieve()
    {
        self::authorizeFromEnv();

        $receiver = $this->createTestBitcoinReceiver("do+fill_now@stripe.com");

        $r = BitcoinReceiver::retrieve($receiver->id);
        $this->assertSame($receiver->id, $r->id);

        $this->assertInstanceOf('Stripe\\BitcoinTransaction', $r->transactions->data[0]);
    }

    public function testList()
    {
        self::authorizeFromEnv();

        $receiver = $this->createTestBitcoinReceiver("do+fill_now@stripe.com");

        $receivers = BitcoinReceiver::all();
        $this->assertTrue(count($receivers->data) > 0);
    }

    public function testListTransactions()
    {
        self::authorizeFromEnv();

        $receiver = $this->createTestBitcoinReceiver("do+fill_now@stripe.com");
        $this->assertSame(0, count($receiver->transactions->data));

        $transactions = $receiver->transactions->all(array("limit" => 1));
        $this->assertSame(1, count($transactions->data));
    }

    public function testDeleteWithCustomer()
    {
        self::authorizeFromEnv();
        $receiver = $this->createTestBitcoinReceiver("do+fill_now@stripe.com");
        $customer = Customer::create(array("source" => $receiver->id));
        $charge = Charge::create(array(
            "customer" => $customer->id,
            "amount" => $receiver->amount,
            "currency" => $receiver->currency
        ));
        $receiver = BitcoinReceiver::retrieve($receiver->id);
        $response = $receiver->delete();
        $this->assertTrue($response->deleted);
    }

    public function testUpdateWithCustomer()
    {
        self::authorizeFromEnv();
        $receiver = $this->createTestBitcoinReceiver("do+fill_now@stripe.com");
        $customer = Customer::create(array("source" => $receiver->id));
        $receiver = BitcoinReceiver::retrieve($receiver->id);

        $receiver->description = "a new description";
        $receiver->save();

        $base = Customer::classUrl();
        $parentExtn = $receiver['customer'];
        $extn = $receiver['id'];
        $this->assertEquals("$base/$parentExtn/sources/$extn", $receiver->instanceUrl());

        $updatedReceiver = BitcoinReceiver::retrieve($receiver->id);
        $this->assertEquals($receiver["description"], $updatedReceiver["description"]);
    }

    public function testUpdateWithoutCustomer()
    {
        self::authorizeFromEnv();
        $receiver = $this->createTestBitcoinReceiver("do+fill_now@stripe.com");

        $receiver->description = "a new description";
        $receiver->save();

        $this->assertEquals(BitcoinReceiver::classUrl() . "/" . $receiver['id'], $receiver->instanceUrl());

        $updatedReceiver = BitcoinReceiver::retrieve($receiver->id);
        $this->assertEquals($receiver["description"], $updatedReceiver["description"]);
    }

    public function testRefund()
    {
        self::authorizeFromEnv();
        $receiver = $this->createTestBitcoinReceiver("do+fill_now@stripe.com");

        $receiver = BitcoinReceiver::retrieve($receiver->id);
        $this->assertNull($receiver->refund_address);

        $refundAddress = "REFUNDHERE";
        $receiver->refund(array("refund_address" => $refundAddress));

        $this->assertSame($refundAddress, $receiver->refund_address);
    }
}
