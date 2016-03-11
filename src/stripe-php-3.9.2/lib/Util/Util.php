<?php

namespace Stripe\Util;

use Stripe\StripeObject;

abstract class Util
{
    /**
     * Whether the provided array (or other) is a list rather than a dictionary.
     *
     * @param array|mixed $array
     * @return boolean True if the given object is a list.
     */
    public static function isList($array)
    {
        if (!is_array($array)) {
            return false;
        }

      // TODO: generally incorrect, but it's correct given Stripe's response
        foreach (array_keys($array) as $k) {
            if (!is_numeric($k)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Recursively converts the PHP Stripe object to an array.
     *
     * @param array $values The PHP Stripe object to convert.
     * @return array
     */
    public static function convertStripeObjectToArray($values)
    {
        $results = array();
        foreach ($values as $k => $v) {
            // FIXME: this is an encapsulation violation
            if ($k[0] == '_') {
                continue;
            }
            if ($v instanceof StripeObject) {
                $results[$k] = $v->__toArray(true);
            } elseif (is_array($v)) {
                $results[$k] = self::convertStripeObjectToArray($v);
            } else {
                $results[$k] = $v;
            }
        }
        return $results;
    }

    /**
     * Converts a response from the Stripe API to the corresponding PHP object.
     *
     * @param array $resp The response from the Stripe API.
     * @param array $opts
     * @return StripeObject|array
     */
    public static function convertToStripeObject($resp, $opts)
    {
        $types = array(
            'account' => 'Stripe\\Account',
            'alipay_account' => 'Stripe\\AlipayAccount',
            'bank_account' => 'Stripe\\BankAccount',
            'balance_transaction' => 'Stripe\\BalanceTransaction',
            'card' => 'Stripe\\Card',
            'charge' => 'Stripe\\Charge',
            'country_spec' => 'Stripe\\CountrySpec',
            'coupon' => 'Stripe\\Coupon',
            'customer' => 'Stripe\\Customer',
            'dispute' => 'Stripe\\Dispute',
            'list' => 'Stripe\\Collection',
            'invoice' => 'Stripe\\Invoice',
            'invoiceitem' => 'Stripe\\InvoiceItem',
            'event' => 'Stripe\\Event',
            'file' => 'Stripe\\FileUpload',
            'token' => 'Stripe\\Token',
            'transfer' => 'Stripe\\Transfer',
            'order' => 'Stripe\\Order',
            'plan' => 'Stripe\\Plan',
            'product' => 'Stripe\\Product',
            'recipient' => 'Stripe\\Recipient',
            'refund' => 'Stripe\\Refund',
            'sku' => 'Stripe\\SKU',
            'subscription' => 'Stripe\\Subscription',
            'fee_refund' => 'Stripe\\ApplicationFeeRefund',
            'bitcoin_receiver' => 'Stripe\\BitcoinReceiver',
            'bitcoin_transaction' => 'Stripe\\BitcoinTransaction',
        );
        if (self::isList($resp)) {
            $mapped = array();
            foreach ($resp as $i) {
                array_push($mapped, self::convertToStripeObject($i, $opts));
            }
            return $mapped;
        } elseif (is_array($resp)) {
            if (isset($resp['object']) && is_string($resp['object']) && isset($types[$resp['object']])) {
                $class = $types[$resp['object']];
            } else {
                $class = 'Stripe\\StripeObject';
            }
            return $class::constructFrom($resp, $opts);
        } else {
            return $resp;
        }
    }

    /**
     * @param string|mixed $value A string to UTF8-encode.
     *
     * @return string|mixed The UTF8-encoded string, or the object passed in if
     *    it wasn't a string.
     */
    public static function utf8($value)
    {
        if (is_string($value) && mb_detect_encoding($value, "UTF-8", true) != "UTF-8") {
            return utf8_encode($value);
        } else {
            return $value;
        }
    }
}
