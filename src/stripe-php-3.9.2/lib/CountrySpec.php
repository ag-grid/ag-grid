<?php

namespace Stripe;

class CountrySpec extends ApiResource
{
    /**
     * This is a special case because the country specs endpoint has an
     *    underscore in it. The parent `className` function strips underscores.
     *
     * @return string The name of the class.
     */
    public static function className()
    {
        return 'country_spec';
    }

    /**
     * @param string $country The ISO country code of the country we retrieve the CountrySpec for.
     * @param array|string|null $opts
     *
     * @return CountrySpec
     */
    public static function retrieve($country, $opts = null)
    {
        return self::_retrieve($country, $opts);
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return Collection of CountrySpecs
     */
    public static function all($params = null, $opts = null)
    {
        return self::_all($params, $opts);
    }
}
