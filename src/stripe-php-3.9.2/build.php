#!/usr/bin/env php
<?php
chdir(dirname(__FILE__));

$autoload = (int)$argv[1];
$returnStatus = null;

if (!$autoload) {
    // Modify composer to not autoload Stripe
    $composer = json_decode(file_get_contents('composer.json'), true);
    unset($composer['autoload']);
    unset($composer['require-dev']['squizlabs/php_codesniffer']);
    file_put_contents('composer.json', json_encode($composer));
}

passthru('composer install', $returnStatus);
if ($returnStatus !== 0) {
    exit(1);
}

if ($autoload) {
    // Only run CS on 1 of the 2 environments
    passthru(
        './vendor/bin/phpcs --standard=PSR2 -n lib tests *.php',
        $returnStatus
    );
    if ($returnStatus !== 0) {
        exit(1);
    }
}

$config = $autoload ? 'phpunit.xml' : 'phpunit.no_autoload.xml';
passthru("./vendor/bin/phpunit -c $config", $returnStatus);
if ($returnStatus !== 0) {
    exit(1);
}
