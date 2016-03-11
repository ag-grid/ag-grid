<?php

namespace Stripe;

class Invoice extends ApiResource
{
    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return Invoice The created invoice.
     */
    public static function create($params = null, $opts = null)
    {
        return self::_create($params, $opts);
    }

    /**
     * @param string $id The ID of the invoice to retrieve.
     * @param array|string|null $opts
     *
     * @return Invoice
     */
    public static function retrieve($id, $opts = null)
    {
        return self::_retrieve($id, $opts);
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return Collection of Invoices
     */
    public static function all($params = null, $opts = null)
    {
        return self::_all($params, $opts);
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return Invoice The upcoming invoice.
     */
    public static function upcoming($params = null, $opts = null)
    {
        $url = static::classUrl() . '/upcoming';
        list($response, $opts) = static::_staticRequest('get', $url, $params, $opts);
        $obj = Util\Util::convertToStripeObject($response->json, $opts);
        $obj->setLastResponse($response);
        return $obj;
    }

    /**
     * @param array|string|null $opts
     *
     * @return Invoice The saved invoice.
     */
    public function save($opts = null)
    {
        return $this->_save($opts);
    }

    /**
     * @return Invoice The paid invoice.
     */
    public function pay($opts = null)
    {
        $url = $this->instanceUrl() . '/pay';
        list($response, $opts) = $this->_request('post', $url, null, $opts);
        $this->refreshFrom($response, $opts);
        return $this;
    }
}
