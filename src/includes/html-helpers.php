<?php
function meta_and_links($title, $keywords, $description, $root = false) {
    $socialImage = $GLOBALS['socialImage'];
    if ($socialImage) {
        $socialImageMeta = <<<META
    <meta property="og:image" content="$socialImage" />
    <meta name="twitter:image" content="$socialImage" />
META;
    } else {
        $socialImageMeta = '';
    }

    $socialUrl = $GLOBALS['socialUrl'];
    if ($socialUrl) {
        $socialUrlMeta = <<<META
    <meta property="og:image" content="$socialUrlMeta" />
    <meta name="twitter:image" content="$socialUrlMeta" />
META;
    } else {
        $socialUrlMeta = '';
    }

    if ($root) {
        $prefix = "";
    } else {
        $prefix = "../";
    }
    echo <<<META
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
    <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,900" rel="stylesheet">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">

    <title>$title</title>

    <meta name="description" content="$description">
    <meta name="keywords" content="$keywords">

    <meta property="og:type" content="website">
    <meta property="og:title" content="ag-Grid">
    <meta property="og:description" content="$description">

    <meta name="twitter:card" content="summary">
    <meta name="twitter:site" content="@ceolter">
    <meta name="twitter:title" content="ag-Grid">
    <meta name="twitter:description" content="$description">

    $socialUrlMeta
    $socialImageMeta

    <link rel="icon" type="image/png" sizes="32x32" href="{$prefix}_assets/favicons/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="{$prefix}_assets/favicons/favicon-16x16.png">
    <link rel="shortcut icon" href="{$prefix}_assets/favicons/favicon.ico">
META;
}

function docScripts() {
    echo <<<SCRIPT
<script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.5/angular.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.5/angular-cookies.min.js"></script>
<script src="../documentation-main/documentation.js"></script>
<script src="../dist/docs.js"></script>
SCRIPT;
}
?>


