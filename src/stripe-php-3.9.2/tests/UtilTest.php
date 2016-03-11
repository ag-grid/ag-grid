<?php

namespace Stripe;

class UtilTest extends TestCase
{
    public function testIsList()
    {
        $list = array(5, 'nstaoush', array());
        $this->assertTrue(Util\Util::isList($list));

        $notlist = array(5, 'nstaoush', array(), 'bar' => 'baz');
        $this->assertFalse(Util\Util::isList($notlist));
    }

    public function testThatPHPHasValueSemanticsForArrays()
    {
        $original = array('php-arrays' => 'value-semantics');
        $derived = $original;
        $derived['php-arrays'] = 'reference-semantics';

        $this->assertSame('value-semantics', $original['php-arrays']);
    }

    public function testConvertStripeObjectToArrayIncludesId()
    {
        $customer = self::createTestCustomer();
        $this->assertTrue(array_key_exists("id", $customer->__toArray(true)));
    }

    public function testUtf8()
    {
        // UTF-8 string
        $x = "\xc3\xa9";
        $this->assertSame(Util\Util::utf8($x), $x);

        // Latin-1 string
        $x = "\xe9";
        $this->assertSame(Util\Util::utf8($x), "\xc3\xa9");

        // Not a string
        $x = true;
        $this->assertSame(Util\Util::utf8($x), $x);
    }
}
