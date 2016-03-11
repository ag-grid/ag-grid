<?php

namespace Stripe;

/**
 * Base class for Stripe test cases, provides some utility methods for creating
 * objects.
 */
class TestCase extends \PHPUnit_Framework_TestCase
{
    const API_KEY = 'tGN0bIwXnHdwOa85VABjPdSn8nWY7G7I';

    private $mock;

    protected static function authorizeFromEnv()
    {
        $apiKey = getenv('STRIPE_API_KEY');
        if (!$apiKey) {
            $apiKey = self::API_KEY;
        }

        Stripe::setApiKey($apiKey);
    }

    protected function setUp()
    {
        ApiRequestor::setHttpClient(HttpClient\CurlClient::instance());
        $this->mock = null;
        $this->call = 0;
    }

    protected function mockRequest($method, $path, $params = array(), $return = array('id' => 'myId'), $rcode = 200)
    {
        $mock = $this->setUpMockRequest();
        $mock->expects($this->at($this->call++))
             ->method('request')
             ->with(strtolower($method), 'https://api.stripe.com' . $path, $this->anything(), $params, false)
             ->willReturn(array(json_encode($return), $rcode, array()));
    }

    private function setUpMockRequest()
    {
        if (!$this->mock) {
            self::authorizeFromEnv();
            $this->mock = $this->getMock('\Stripe\HttpClient\ClientInterface');
            ApiRequestor::setHttpClient($this->mock);
        }
        return $this->mock;
    }

    /**
     * Create a valid test charge.
     */
    protected static function createTestCharge(array $attributes = array())
    {
        self::authorizeFromEnv();

        return Charge::create(
            $attributes + array(
                'amount' => 2000,
                'currency' => 'usd',
                'description' => 'Charge for test@example.com',
                'card' => array(
                    'number' => '4242424242424242',
                    'exp_month' => 5,
                    'exp_year' => date('Y') + 3,
                ),
            )
        );
    }

    /**
     * Create a valid test charge.
     */
    protected static function createTestTransfer(array $attributes = array())
    {
        self::authorizeFromEnv();

        $recipient = self::createTestRecipient();

        return Transfer::create(
            $attributes + array(
                'amount' => 2000,
                'currency' => 'usd',
                'description' => 'Transfer to test@example.com',
                'recipient' => $recipient->id
            )
        );
    }

    /**
     * Create a valid test customer.
     */
    protected static function createTestCustomer(array $attributes = array())
    {
        self::authorizeFromEnv();

        return Customer::create(
            $attributes + array(
                'card' => array(
                    'number' => '4242424242424242',
                    'exp_month' => 5,
                    'exp_year' => date('Y') + 3,
                ),
            )
        );
    }

    /**
     * Create a valid test recipient
     */
    protected static function createTestRecipient(array $attributes = array())
    {
        self::authorizeFromEnv();

        return Recipient::create(
            $attributes + array(
                'name' => 'PHP Test',
                'type' => 'individual',
                'tax_id' => '000000000',
                'bank_account' => array(
                    'country'    => 'US',
                    'routing_number' => '110000000',
                    'account_number'  => '000123456789'
                ),
            )
        );
    }

    /**
     * Create a test account
     */
    protected static function createTestAccount(array $attributes = array())
    {
        self::authorizeFromEnv();

        return Account::create(
            $attributes + array(
                'managed' => false,
                'country' => 'US',
                'email' => self::generateRandomEmail(),
            )
        );
    }

    /**
     * Verify that a plan with a given ID exists, or create a new one if it does
     * not.
     */
    protected static function retrieveOrCreatePlan($id)
    {
        self::authorizeFromEnv();

        try {
            $plan = Plan::retrieve($id);
        } catch (Error\InvalidRequest $exception) {
            $plan = Plan::create(
                array(
                    'id' => $id,
                    'amount' => 0,
                    'currency' => 'usd',
                    'interval' => 'month',
                    'name' => 'Gold Test Plan',
                )
            );
        }
    }

    /**
     * Verify that a coupon with a given ID exists, or create a new one if it
     * does not.
     */
    protected static function retrieveOrCreateCoupon($id)
    {
        self::authorizeFromEnv();

        try {
            $coupon = Coupon::retrieve($id);
        } catch (Error\InvalidRequest $exception) {
            $coupon = Coupon::create(
                array(
                    'id' => $id,
                    'duration' => 'forever',
                    'percent_off' => 25,
                )
            );
        }
    }

    /**
     * Genereate a semi-random string
     */
    protected static function generateRandomString($length = 24)
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTU';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }

    /**
     * Generate a semi-random email.
     */
    protected static function generateRandomEmail($domain = 'bar.com')
    {
        return self::generateRandomString().'@'.$domain;
    }

    protected static function createTestBitcoinReceiver($email)
    {
        $receiver = BitcoinReceiver::create(
            array(
                'amount' => 100,
                'currency' => 'usd',
                'description' => 'some details',
                'email' => $email
            )
        );
        return $receiver;
    }
}
