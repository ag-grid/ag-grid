# Stripe PHP bindings

[![Build Status](https://travis-ci.org/stripe/stripe-php.svg?branch=master)](https://travis-ci.org/stripe/stripe-php)
[![Latest Stable Version](https://poser.pugx.org/stripe/stripe-php/v/stable.svg)](https://packagist.org/packages/stripe/stripe-php)
[![Total Downloads](https://poser.pugx.org/stripe/stripe-php/downloads.svg)](https://packagist.org/packages/stripe/stripe-php)
[![License](https://poser.pugx.org/stripe/stripe-php/license.svg)](https://packagist.org/packages/stripe/stripe-php)
[![Code Coverage](https://coveralls.io/repos/stripe/stripe-php/badge.svg?branch=master)](https://coveralls.io/r/stripe/stripe-php?branch=master)

You can sign up for a Stripe account at https://stripe.com.

## Requirements

PHP 5.3.3 and later.

## Composer

You can install the bindings via [Composer](http://getcomposer.org/). Run the following command:

```bash
composer require stripe/stripe-php
```

To use the bindings, use Composer's [autoload](https://getcomposer.org/doc/00-intro.md#autoloading):

```php
require_once('vendor/autoload.php');
```

## Manual Installation

If you do not wish to use Composer, you can download the [latest release](https://github.com/stripe/stripe-php/releases). Then, to use the bindings, include the `init.php` file.

```php
require_once('/path/to/stripe-php/init.php');
```

## Getting Started

Simple usage looks like:

```php
\Stripe\Stripe::setApiKey('d8e8fca2dc0f896fd7cb4cb0031ba249');
$myCard = array('number' => '4242424242424242', 'exp_month' => 8, 'exp_year' => 2018);
$charge = \Stripe\Charge::create(array('card' => $myCard, 'amount' => 2000, 'currency' => 'usd'));
echo $charge;
```

## Documentation

Please see https://stripe.com/docs/api for up-to-date documentation.

## Legacy Version Support

If you are using PHP 5.2, you can download v1.18.0 ([zip](https://github.com/stripe/stripe-php/archive/v1.18.0.zip), [tar.gz](https://github.com/stripe/stripe-php/archive/v1.18.0.tar.gz)) from our [releases page](https://github.com/stripe/stripe-php/releases). This version will continue to work with new versions of the Stripe API for all common uses.

This legacy version may be included via `require_once("/path/to/stripe-php/lib/Stripe.php");`, and used like:

```php
Stripe::setApiKey('d8e8fca2dc0f896fd7cb4cb0031ba249');
$myCard = array('number' => '4242424242424242', 'exp_month' => 8, 'exp_year' => 2018);
$charge = Stripe_Charge::create(array('card' => $myCard, 'amount' => 2000, 'currency' => 'usd'));
echo $charge;
```

## Custom Request Timeouts

*NOTE:* We do not recommend decreasing the timeout for non-read-only calls (e.g. charge creation), since even if you locally timeout, the request on Stripe's side can still complete. If you are decreasing timeouts on these calls, make sure to use [idempotency tokens](https://stripe.com/docs/api/php#idempotent_requests) to avoid executing the same transaction twice as a result of timeout retry logic.

To modify request timeouts (connect or total, in seconds) you'll need to tell the API client to use a CurlClient other than its default. You'll set the timeouts in that CurlClient.

```php
// set up your tweaked Curl client
$curl = new \Stripe\HttpClient\CurlClient();
$curl->setTimeout(10); // default is \Stripe\HttpClient\CurlClient::DEFAULT_TIMEOUT
$curl->setConnectTimeout(5); // default is \Stripe\HttpClient\CurlClient::DEFAULT_CONNECT_TIMEOUT

echo $curl->getTimeout(); // 10
echo $curl->getConnectTimeout(); // 5

// tell Stripe to use the tweaked client
\Stripe\ApiRequestor::setHttpClient($curl);

// use the Stripe API client as you normally would
```

## Development

Install dependencies:

``` bash
composer install
```

## Tests

Install dependencies as mentioned above (which will resolve [PHPUnit](http://packagist.org/packages/phpunit/phpunit)), then you can run the test suite:

```bash
./vendor/bin/phpunit
```

Or to run an individual test file:

```bash
./vendor/bin/phpunit tests/UtilTest.php
```
