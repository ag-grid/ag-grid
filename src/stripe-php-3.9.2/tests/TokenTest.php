<?php

namespace Stripe;

class TokenTest extends TestCase
{
    public function testUrls()
    {
        $this->assertSame(Token::classUrl(), '/v1/tokens');
        $token = new Token('abcd/efgh');
        $this->assertSame($token->instanceUrl(), '/v1/tokens/abcd%2Fefgh');
    }
}
