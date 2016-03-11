<?php

namespace Stripe;

// JsonSerializable only exists in PHP 5.4+. Stub if out if it doesn't exist
if (interface_exists('\JsonSerializable', false)) {
    interface JsonSerializable extends \JsonSerializable
    {
    }
} else {
    // PSR2 wants each interface to have its own file.
    // @codingStandardsIgnoreStart
    interface JsonSerializable
    {
        // @codingStandardsIgnoreEnd
        public function jsonSerialize();
    }
}
