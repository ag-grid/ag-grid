<?php

namespace Stripe;

class InvoiceItem extends ApiResource
{
    /**
     * @param string $id The ID of the invoice item to retrieve.
     * @param array|string|null $opts
     *
     * @return InvoiceItem
     */
    public static function retrieve($id, $opts = null)
    {
        return self::_retrieve($id, $opts);
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return Collection of InvoiceItems
     */
    public static function all($params = null, $opts = null)
    {
        return self::_all($params, $opts);
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return InvoiceItem The created invoice item.
     */
    public static function create($params = null, $opts = null)
    {
        return self::_create($params, $opts);
    }

    /**
     * @param array|string|null $opts
     *
     * @return InvoiceItem The saved invoice item.
     */
    public function save($opts = null)
    {
        return $this->_save($opts);
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return InvoiceItem The deleted invoice item.
     */
    public function delete($params = null, $opts = null)
    {
        return $this->_delete($params, $opts);
    }
}
