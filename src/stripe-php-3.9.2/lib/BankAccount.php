<?php

namespace Stripe;

class BankAccount extends ExternalAccount
{
    /**
     * @param array|null $params
     * @param array|string|null $options
     *
     * @return BankAccount The verified bank account.
     */
    public function verify($params = null, $options = null)
    {
        $url = $this->instanceUrl() . '/verify';
        list($response, $opts) = $this->_request('post', $url, $params, $options);
        $this->refreshFrom($response, $opts);
        return $this;
    }
}
