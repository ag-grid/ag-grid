<?php

namespace Stripe;

class Account extends ApiResource
{
    public function instanceUrl()
    {
        if ($this['id'] === null) {
            return '/v1/account';
        } else {
            return parent::instanceUrl();
        }
    }

    /**
     * @param string|null $id
     * @param array|string|null $opts
     *
     * @return Account
     */
    public static function retrieve($id = null, $opts = null)
    {
        if (!$opts && is_string($id) && substr($id, 0, 3) === 'sk_') {
            $opts = $id;
            $id = null;
        }
        return self::_retrieve($id, $opts);
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return Account
     */
    public static function create($params = null, $opts = null)
    {
        return self::_create($params, $opts);
    }

    /**
     * @param array|string|null $opts
     *
     * @return Account
     */
    public function save($opts = null)
    {
        return $this->_save();
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return Account The deleted account.
     */
    public function delete($params = null, $opts = null)
    {
        return $this->_delete($params, $opts);
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return Collection of Accounts
     */
    public static function all($params = null, $opts = null)
    {
        return self::_all($params, $opts);
    }
}
