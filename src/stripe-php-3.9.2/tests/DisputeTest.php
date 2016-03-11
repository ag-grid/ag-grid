<?php

namespace Stripe;

class DisputeTest extends TestCase
{
    public function testUrls()
    {
        $this->assertSame(Dispute::classUrl(), '/v1/disputes');
        $dispute = new Dispute('dp_123');
        $this->assertSame($dispute->instanceUrl(), '/v1/disputes/dp_123');
    }

    private function createDisputedCharge()
    {
        $card = array(
            'number' => '4000000000000259',
            'exp_month' => 5,
            'exp_year' => date('Y') + 1
        );

        $c = Charge::create(
            array(
                'amount' => 100,
                'currency' => 'usd',
                'card' => $card
            )
        );
        $c = Charge::retrieve($c->id);

        $attempts = 0;

        while ($c->dispute === null) {
            if ($attempts > 5) {
                throw "Charge is taking too long to be disputed";
            }
            sleep(1);
            $c = Charge::retrieve($c->id);
            $attempts += 1;
        }

        return $c;
    }

    public function testAll()
    {
        self::authorizeFromEnv();

        $sublist = Dispute::all(
            array(
                'limit' => 3,
            )
        );
        $this->assertSame(3, count($sublist->data));
    }


    public function testUpdate()
    {
        self::authorizeFromEnv();

        $c = $this->createDisputedCharge();

        $d = $c->dispute;
        $d->evidence["customer_name"] = "Bob";
        $s = $d->save();

        $this->assertSame($d->id, $s->id);
        $this->assertSame("Bob", $s->evidence["customer_name"]);
    }

    public function testClose()
    {
        self::authorizeFromEnv();

        $c = $this->createDisputedCharge();

        $d = $c->dispute->close();
        $this->assertSame("lost", $d->status);
    }

    public function testRetrieve()
    {
        self::authorizeFromEnv();

        $c = $this->createDisputedCharge();

        $d = Dispute::retrieve($c->dispute->id);
        $this->assertSame($d->id, $c->dispute->id);
    }
}
