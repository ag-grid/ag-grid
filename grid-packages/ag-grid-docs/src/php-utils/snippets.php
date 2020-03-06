<?php
    function createSnippet($code, $language = 'js') {
        $formattedCode = preg_replace('/\<(\/?[^\>]+)\>/', '&lt;$1&gt;', $code);

        return "<snippet language=\"$language\"><div ng-non-bindable>$formattedCode</div></snippet>";
    }