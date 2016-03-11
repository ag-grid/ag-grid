<?php

namespace Stripe;

class FileUpload extends ApiResource
{
    public static function baseUrl()
    {
        return Stripe::$apiUploadBase;
    }

    public static function className()
    {
        return 'file';
    }

    /**
     * @param string $id The ID of the file upload to retrieve.
     * @param array|string|null $opts
     *
     * @return FileUpload
     */
    public static function retrieve($id, $opts = null)
    {
        return self::_retrieve($id, $opts);
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return FileUpload The created file upload.
     */
    public static function create($params = null, $opts = null)
    {
        return self::_create($params, $opts);
    }

    /**
     * @param array|null $params
     * @param array|string|null $opts
     *
     * @return Collection of FileUploads
     */
    public static function all($params = null, $opts = null)
    {
        return self::_all($params, $opts);
    }
}
