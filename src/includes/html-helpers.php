<?php
function meta_and_links($title, $keywords, $description, $root = false) {
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

    <link rel="icon" type="image/png" sizes="32x32" href="{$prefix}_assets/favicons/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="{$prefix}_assets/favicons/favicon-16x16.png">
    <link rel="shortcut icon" href="{$prefix}_assets/favicons/favicon.ico">
META;
}
?>
