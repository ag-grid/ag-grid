<?php

namespace Stripe;

class Order extends ApiResource
{
    /**
     * @param string $id The ID of the Order to retrieve.
     * @param array|string|null $opts
     *
     * @return Order
     */
    public static function retrieve($id, $opts = null)
    {
        return self::_retrieve($id, $opts);
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return Order The created Order.
     */
    public static function create($params = null, $opts = null)
    {
        return self::_create($params, $opts);
    }

    /**
     * @param array|string|null $opts
     *
     * @return Order The saved Order.
     */
    public function save($opts = null)
    {
        return $this->_save($opts);
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return Collection of Orders
     */
    public static function all($params = null, $opts = null)
    {
        return self::_all($params, $opts);
    }

    /**
     * @return Order The paid order.
     */
    public function pay($params = null, $opts = null)
    {
        $url = $this->instanceUrl() . '/pay';
        list($response, $opts) = $this->_request('post', $url, $params, $opts);
        $this->refreshFrom($response, $opts);
        return $this;
    }
}
