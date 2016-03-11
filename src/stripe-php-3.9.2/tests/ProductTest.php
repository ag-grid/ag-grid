<?php

namespace Stripe;

class ProductSKUOrderTest extends TestCase
{
    public function testProductFalseyId()
    {
        try {
            Stripe::setApiKey('sk_test_JieJALRz7rPz7boV17oMma7a');
            $retrievedProduct = Product::retrieve('0');
        } catch (Error\InvalidRequest $e) {
            // Can either succeed or 404, all other errors are bad
            if ($e->httpStatus !== 404) {
                $this->fail();
            }
        }
    }

    public function testProductCreateUpdateRead()
    {

        Stripe::setApiKey('sk_test_JieJALRz7rPz7boV17oMma7a');
        $ProductID = 'gold-' . self::generateRandomString(20);
        $p = Product::create(array(
            'name'     => 'Gold Product',
            'id'       => $ProductID,
            'url'      => 'www.stripe.com/gold'
        ));
        $this->assertSame($p->url, 'www.stripe.com/gold');

        $p->name = 'A new Product name';
        $p->save();
        $this->assertSame($p->name, 'A new Product name');
        $this->assertSame($p->url, 'www.stripe.com/gold');

        $stripeProduct = Product::retrieve($ProductID);
        $this->assertSame($p->name, $stripeProduct->name);
        $this->assertSame($stripeProduct->url, 'www.stripe.com/gold');
    }

    public function testSKUCreateUpdateRead()
    {
        Stripe::setApiKey('sk_test_JieJALRz7rPz7boV17oMma7a');
        $ProductID = 'silver-' . self::generateRandomString(20);
        $p = Product::create(array(
            'name'     => 'Silver Product',
            'id'       => $ProductID,
            'url'      => 'www.stripe.com/silver'
        ));

        $SkuID = 'silver-sku-' . self::generateRandomString(20);
        $sku = SKU::create(array(
            'price'     => 500,
            'currency'  => 'usd',
            'id'        => $SkuID,
            'inventory' => array(
                'type'     => 'finite',
                'quantity' => 40
            ),
            'product'   => $ProductID
        ));

        $sku->price = 600;
        $sku->save();
        $this->assertSame($sku->price, 600);

        $stripeSku = SKU::retrieve($SkuID);
        $this->assertSame($sku->price, 600);
        $this->assertSame('finite', $sku->inventory->type);
        $this->assertSame(40, $sku->inventory->quantity);
    }

    public function testSKUProductDelete()
    {
        Stripe::setApiKey('sk_test_JieJALRz7rPz7boV17oMma7a');
        $ProductID = 'silver-' . self::generateRandomString(20);
        $p = Product::create(array(
            'name'     => 'Silver Product',
            'id'       => $ProductID,
            'url'      => 'stripe.com/silver'
        ));

        $SkuID = 'silver-sku-' . self::generateRandomString(20);
        $sku = SKU::create(array(
            'price'     => 500,
            'currency'  => 'usd',
            'id'        => $SkuID,
            'inventory' => array(
                'type'     => 'finite',
                'quantity' => 40
            ),
            'product'   => $ProductID
        ));

        $deletedSku = $sku->delete();
        $this->assertTrue($deletedSku->deleted);

        $deletedProduct = $p->delete();
        $this->assertTrue($deletedProduct->deleted);
    }

    public function testOrderCreateUpdateRetrievePay()
    {
        Stripe::setApiKey('sk_test_JieJALRz7rPz7boV17oMma7a');
        $ProductID = 'silver-' . self::generateRandomString(20);
        $p = Product::create(array(
            'name'      => 'Silver Product',
            'id'        => $ProductID,
            'url'       => 'www.stripe.com/silver',
            'shippable' => false,
        ));

        $SkuID = 'silver-sku-' . self::generateRandomString(20);
        $sku = SKU::create(array(
            'price'     => 500,
            'currency'  => 'usd',
            'id'        => $SkuID,
            'inventory' => array(
                'type'     => 'finite',
                'quantity' => 40
            ),
            'product'   => $ProductID
        ));

        $order = Order::create(array(
            'items' => array(
                0 => array(
                    'type' => 'sku',
                    'parent' => $SkuID,
                ),
            ),
            'currency' => 'usd',
            'email' => 'foo@bar.com',
        ));

        $order->metadata->foo = "bar";
        $order->save();

        $stripeOrder = Order::retrieve($order->id);
        $this->assertSame($order->metadata->foo, "bar");

        $order->pay(array(
            'source' => array(
                'object' => 'card',
                'number' => '4242424242424242',
                'exp_month' => '05',
                'exp_year' => '2017'
            ),
        ));
        $this->assertSame($order->status, 'paid');
    }
}
