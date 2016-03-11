<?php

namespace Stripe;

class Customer extends ApiResource
{
    /**
     * @param string $id The ID of the customer to retrieve.
     * @param array|string|null $opts
     *
     * @return Customer
     */
    public static function retrieve($id, $opts = null)
    {
        return self::_retrieve($id, $opts);
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return Collection of Customers
     */
    public static function all($params = null, $opts = null)
    {
        return self::_all($params, $opts);
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return Customer The created customer.
     */
    public static function create($params = null, $opts = null)
    {
        return self::_create($params, $opts);
    }

    /**
     * @param array|string|null $opts
     *
     * @return Customer The saved customer.
     */
    public function save($opts = null)
    {
        return $this->_save($opts);
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return Customer The deleted customer.
     */
    public function delete($params = null, $opts = null)
    {
        return $this->_delete($params, $opts);
    }

    /**
     * @param array|null $params
     *
     * @return InvoiceItem The resulting invoice item.
     */
    public function addInvoiceItem($params = null)
    {
        if (!$params) {
            $params = array();
        }
        $params['customer'] = $this->id;
        $ii = InvoiceItem::create($params, $this->_opts);
        return $ii;
    }

    /**
     * @param array|null $params
     *
     * @return array An array of the customer's Invoices.
     */
    public function invoices($params = null)
    {
        if (!$params) {
            $params = array();
        }
        $params['customer'] = $this->id;
        $invoices = Invoice::all($params, $this->_opts);
        return $invoices;
    }

    /**
     * @param array|null $params
     *
     * @return array An array of the customer's InvoiceItems.
     */
    public function invoiceItems($params = null)
    {
        if (!$params) {
            $params = array();
        }
        $params['customer'] = $this->id;
        $iis = InvoiceItem::all($params, $this->_opts);
        return $iis;
    }

    /**
     * @param array|null $params
     *
     * @return array An array of the customer's Charges.
     */
    public function charges($params = null)
    {
        if (!$params) {
            $params = array();
        }
        $params['customer'] = $this->id;
        $charges = Charge::all($params, $this->_opts);
        return $charges;
    }

    /**
     * @param array|null $params
     *
     * @return Subscription The updated subscription.
     */
    public function updateSubscription($params = null)
    {
        $url = $this->instanceUrl() . '/subscription';
        list($response, $opts) = $this->_request('post', $url, $params);
        $this->refreshFrom(array('subscription' => $response), $opts, true);
        return $this->subscription;
    }

    /**
     * @param array|null $params
     *
     * @return Subscription The cancelled subscription.
     */
    public function cancelSubscription($params = null)
    {
        $url = $this->instanceUrl() . '/subscription';
        list($response, $opts) = $this->_request('delete', $url, $params);
        $this->refreshFrom(array('subscription' => $response), $opts, true);
        return $this->subscription;
    }

    /**
     * @param array|null $params
     *
     * @return Customer The updated customer.
     */
    public function deleteDiscount()
    {
        $url = $this->instanceUrl() . '/discount';
        list($response, $opts) = $this->_request('delete', $url);
        $this->refreshFrom(array('discount' => null), $opts, true);
    }
}
