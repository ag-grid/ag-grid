<?php
    function createSnippet($code, $language = 'js') {
        $formattedCode = str_replace('<', '&lt;', $code);
        $formattedCode = str_replace('>', '&gt;', $formattedCode);

        return "<snippet language=\"$language\"><div ng-non-bindable>$formattedCode</div></snippet>";
    }

    function inlineCode($code) {
        $formattedCode = str_replace('<', '&lt;', $code);
        $formattedCode = str_replace('>', '&gt;', $formattedCode);
        $formattedCode = str_replace(' ', '&nbsp;', $formattedCode);

        return "<code>$formattedCode</code>";
    }