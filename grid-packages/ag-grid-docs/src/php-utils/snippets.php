<?php
    function createSnippet($code, $language = 'js') {
        $formattedCode = preg_replace('/\<(\/?[^\>]+)\>/', '&lt;$1&gt;', $code);

        return "<snippet language=\"$language\">$formattedCode</snippet>";
    }