<?php

namespace Stripe;

class StripeObjectTest extends TestCase
{
    public function testArrayAccessorsSemantics()
    {
        $s = new StripeObject();
        $s['foo'] = 'a';
        $this->assertSame($s['foo'], 'a');
        $this->assertTrue(isset($s['foo']));
        unset($s['foo']);
        $this->assertFalse(isset($s['foo']));
    }

    public function testNormalAccessorsSemantics()
    {
        $s = new StripeObject();
        $s->foo = 'a';
        $this->assertSame($s->foo, 'a');
        $this->assertTrue(isset($s->foo));
        unset($s->foo);
        $this->assertFalse(isset($s->foo));
    }

    public function testArrayAccessorsMatchNormalAccessors()
    {
        $s = new StripeObject();
        $s->foo = 'a';
        $this->assertSame($s['foo'], 'a');

        $s['bar'] = 'b';
        $this->assertSame($s->bar, 'b');
    }

    public function testKeys()
    {
        $s = new StripeObject();
        $s->foo = 'a';
        $this->assertSame($s->keys(), array('foo'));
    }

    public function testToArray()
    {
        $s = new StripeObject();
        $s->foo = 'a';

        $converted = $s->__toArray();

        $this->assertInternalType('array', $converted);
        $this->assertArrayHasKey('foo', $converted);
        $this->assertEquals('a', $converted['foo']);
    }

    public function testRecursiveToArray()
    {
        $s = new StripeObject();
        $z = new StripeObject();

        $s->child = $z;
        $z->foo = 'a';

        $converted = $s->__toArray(true);

        $this->assertInternalType('array', $converted);
        $this->assertArrayHasKey('child', $converted);
        $this->assertInternalType('array', $converted['child']);
        $this->assertArrayHasKey('foo', $converted['child']);
        $this->assertEquals('a', $converted['child']['foo']);
    }

    public function testNonexistentProperty()
    {
        $s = new StripeObject();
        $this->assertNull($s->nonexistent);
    }

    public function testPropertyDoesNotExists()
    {
        $s = new StripeObject();
        $this->assertNull($s['nonexistent']);
    }

    public function testJsonEncode()
    {
        // We can only JSON encode our objects in PHP 5.4+. 5.3 must use ->__toJSON()
        if (version_compare(phpversion(), '5.4.0', '<')) {
            return;
        }

        $s = new StripeObject();
        $s->foo = 'a';

        $this->assertEquals('{"foo":"a"}', json_encode($s->__toArray()));
    }

    public function testReplaceNewNestedUpdatable()
    {
        StripeObject::init(); // Populate the $nestedUpdatableAttributes Set
        $s = new StripeObject();

        $s->metadata = array('bar');
        $this->assertSame($s->metadata, array('bar'));
        $s->metadata = array('baz', 'qux');
        $this->assertSame($s->metadata, array('baz', 'qux'));
    }
}
