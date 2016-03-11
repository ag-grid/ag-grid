<?php

namespace Stripe;

class TransferTest extends TestCase
{
    public function testCreate()
    {
        $recipient = self::createTestRecipient();

        self::authorizeFromEnv();
        $transfer = Transfer::create(array(
            'amount' => 100,
            'currency' => 'usd',
            'recipient' => $recipient->id
        ));
        $this->assertSame('pending', $transfer->status);
    }

    public function testRetrieve()
    {
        $recipient = self::createTestRecipient();

        self::authorizeFromEnv();
        $transfer = Transfer::create(array(
            'amount' => 100,
            'currency' => 'usd',
            'recipient' => $recipient->id
        ));
        $reloaded = Transfer::retrieve($transfer->id);
        $this->assertSame($reloaded->id, $transfer->id);
    }

    /**
     * @expectedException Stripe\Error\InvalidRequest
     */
    public function testCancel()
    {
        $recipient = self::createTestRecipient();

        self::authorizeFromEnv();
        $transfer = Transfer::create(array(
            'amount' => 100,
            'currency' => 'usd',
            'recipient' => $recipient->id
        ));
        $reloaded = Transfer::retrieve($transfer->id);
        $this->assertSame($reloaded->id, $transfer->id);

        $reloaded->cancel();
    }

    public function testTransferUpdateMetadata()
    {
        $recipient = self::createTestRecipient();

        self::authorizeFromEnv();
        $transfer = Transfer::create(array(
            'amount' => 100,
            'currency' => 'usd',
            'recipient' => $recipient->id
        ));

        $transfer->metadata['test'] = 'foo bar';
        $transfer->save();

        $updatedTransfer = Transfer::retrieve($transfer->id);
        $this->assertSame('foo bar', $updatedTransfer->metadata['test']);
    }

    public function testTransferUpdateMetadataAll()
    {
        $recipient = self::createTestRecipient();

        self::authorizeFromEnv();
        $transfer = Transfer::create(array(
            'amount' => 100,
            'currency' => 'usd',
            'recipient' => $recipient->id
        ));

        $transfer->metadata = array('test' => 'foo bar');
        $transfer->save();

        $updatedTransfer = Transfer::retrieve($transfer->id);
        $this->assertSame('foo bar', $updatedTransfer->metadata['test']);
    }

    public function testRecipientUpdateMetadata()
    {
        $recipient = self::createTestRecipient();

        $recipient->metadata['test'] = 'foo bar';
        $recipient->save();

        $updatedRecipient = Recipient::retrieve($recipient->id);
        $this->assertSame('foo bar', $updatedRecipient->metadata['test']);
    }

    public function testRecipientUpdateMetadataAll()
    {
        $recipient = self::createTestRecipient();

        $recipient->metadata = array('test' => 'foo bar');
        $recipient->save();

        $updatedRecipient = Recipient::retrieve($recipient->id);
        $this->assertSame('foo bar', $updatedRecipient->metadata['test']);
    }
}
