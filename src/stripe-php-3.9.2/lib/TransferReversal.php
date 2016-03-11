<?php

namespace Stripe;

class TransferReversal extends ApiResource
{
    /**
     * @return string The API URL for this Stripe transfer reversal.
     */
    public function instanceUrl()
    {
        $id = $this['id'];
        $transfer = $this['transfer'];
        if (!$id) {
            throw new Error\InvalidRequest(
                "Could not determine which URL to request: " .
                "class instance has invalid ID: $id",
                null
            );
        }
        $id = Util\Util::utf8($id);
        $transfer = Util\Util::utf8($transfer);

        $base = Transfer::classUrl();
        $transferExtn = urlencode($transfer);
        $extn = urlencode($id);
        return "$base/$transferExtn/reversals/$extn";
    }

    /**
     * @param array|string|null $opts
     *
     * @return TransferReversal The saved reversal.
     */
    public function save($opts = null)
    {
        return $this->_save($opts);
    }
}
