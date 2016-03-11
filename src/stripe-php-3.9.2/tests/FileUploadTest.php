<?php

namespace Stripe;

class FileUploadTest extends TestCase
{
    public function testCreateFile()
    {
        $fp = fopen(dirname(__FILE__).'/../data/test.png', 'r');
        self::authorizeFromEnv();
        $file = FileUpload::create(
            array(
                'purpose' => 'dispute_evidence',
                'file' => $fp,
            )
        );
        fclose($fp);
        $this->assertSame(95, $file->size);
        $this->assertSame('png', $file->type);
    }

    public function testCreateAndRetrieveCurlFile()
    {
        if (!class_exists('\CurlFile', false)) {
            // Older PHP versions don't support this
            return;
        }

        $curlFile = new \CurlFile(dirname(__FILE__).'/../data/test.png');
        self::authorizeFromEnv();
        $file = FileUpload::create(
            array(
                'purpose' => 'dispute_evidence',
                'file' => $curlFile,
            )
        );
        $this->assertSame(95, $file->size);
        $this->assertSame('png', $file->type);

        // Just check that we don't get exceptions
        $file = FileUpload::retrieve($file->id);
        $file->refresh();
    }
}
