<?php

namespace Stripe;

class Transfer extends ApiResource
{
    /**
     * @param string $id The ID of the transfer to retrieve.
     * @param array|string|null $opts
     *
     * @return Transfer
     */
    public static function retrieve($id, $opts = null)
    {
        return self::_retrieve($id, $opts);
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return Collection of Transfers
     */
    public static function all($params = null, $opts = null)
    {
        return self::_all($params, $opts);
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return Transfer The created transfer.
     */
    public static function create($params = null, $opts = null)
    {
        return self::_create($params, $opts);
    }

    /**
     * @return TransferReversal The created transfer reversal.
     */
    public function reverse($params = null, $opts = null)
    {
        $url = $this->instanceUrl() . '/reversals';
        list($response, $opts) = $this->_request('post', $url, $params, $options);
        $this->refreshFrom($response, $opts);
        return $this;
    }

    /**
     * @return Transfer The canceled transfer.
     */
    public function cancel()
    {
        $url = $this->instanceUrl() . '/cancel';
        list($response, $opts) = $this->_request('post', $url);
        $this->refreshFrom($response, $opts);
        return $this;
    }

    /**
     * @param array|string|null $opts
     *
     * @return Transfer The saved transfer.
     */
    public function save($opts = null)
    {
        return $this->_save($opts);
    }
}
