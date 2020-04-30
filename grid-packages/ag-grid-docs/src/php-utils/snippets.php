<?php
    function createSnippet($code, $language = 'js') {
        $formattedCode = str_replace('<', '&lt;', $code);
        $formattedCode = str_replace('>', '&gt;', $formattedCode);

        return "<snippet language=\"$language\"><div ng-non-bindable>$formattedCode</div></snippet>";
    }