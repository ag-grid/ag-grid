<?php

namespace Stripe;

class CouponTest extends TestCase
{
    public function testSave()
    {
        self::authorizeFromEnv();
        $id = 'test_coupon-' . self::generateRandomString(20);
        $c = Coupon::create(
            array(
                'percent_off' => 25,
                'duration' => 'repeating',
                'duration_in_months' => 5,
                'id' => $id,
            )
        );
        $this->assertSame($id, $c->id);
        // @codingStandardsIgnoreStart
        $this->assertSame(25, $c->percent_off);
        // @codingStandardsIgnoreEnd
        $c->metadata['foo'] = 'bar';
        $c->save();

        $stripeCoupon = Coupon::retrieve($id);
        $this->assertEquals($c->metadata, $stripeCoupon->metadata);
    }
}
