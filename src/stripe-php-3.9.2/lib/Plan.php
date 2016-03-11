<?php

namespace Stripe;

class Plan extends ApiResource
{
    /**
     * @param string $id The ID of the plan to retrieve.
     * @param array|string|null $opts
     *
     * @return Plan
     */
    public static function retrieve($id, $opts = null)
    {
        return self::_retrieve($id, $opts);
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return Plan The created plan.
     */
    public static function create($params = null, $opts = null)
    {
        return self::_create($params, $opts);
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return Plan The deleted plan.
     */
    public function delete($params = null, $opts = null)
    {
        return $this->_delete($params, $opts);
    }

    /**
     * @param array|string|null $opts
     *
     * @return Plan The saved plan.
     */
    public function save($opts = null)
    {
        return $this->_save($opts);
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return Collection of Plans
     */
    public static function all($params = null, $opts = null)
    {
        return self::_all($params, $opts);
    }
}
