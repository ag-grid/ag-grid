<?php

namespace Stripe;

class PlanTest extends TestCase
{
    public function testDeletion()
    {
        self::authorizeFromEnv();
        $p = Plan::create(array(
            'amount' => 2000,
            'interval' => 'month',
            'currency' => 'usd',
            'name' => 'Plan',
            'id' => 'gold-' . self::generateRandomString(20)
        ));
        $p->delete();
        $this->assertTrue($p->deleted);
    }

    public function testFalseyId()
    {
        try {
            $retrievedPlan = Plan::retrieve('0');
        } catch (Error\InvalidRequest $e) {
            // Can either succeed or 404, all other errors are bad
            if ($e->httpStatus !== 404) {
                $this->fail();
            }
        }
    }

    public function testSave()
    {
        self::authorizeFromEnv();
        $planID = 'gold-' . self::generateRandomString(20);
        $p = Plan::create(array(
            'amount'   => 2000,
            'interval' => 'month',
            'currency' => 'usd',
            'name'     => 'Plan',
            'id'       => $planID
        ));
        $p->name = 'A new plan name';
        $p->save();
        $this->assertSame($p->name, 'A new plan name');

        $stripePlan = Plan::retrieve($planID);
        $this->assertSame($p->name, $stripePlan->name);
    }
}
