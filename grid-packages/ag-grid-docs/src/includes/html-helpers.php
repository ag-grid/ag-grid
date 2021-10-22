<?php
require_once dirname(__FILE__) . "/../config.php";

$GTM_SCRIPT = <<<SCRIPT
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T7JG534');</script>
<!-- End Google Tag Manager -->
SCRIPT;

$GTM_DATA_LAYER = json_encode(array('default' => true));

function gtm_data_layer($pageCategory, $additional = array()) {
    $additional['pageCategory'] = $pageCategory;
    $GLOBALS['GTM_DATA_LAYER'] = json_encode($additional);
}

function meta_and_links($title, $keywords, $description, $url, $root = false) {
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
    <meta property="og:url" content="$socialUrl" />
    <meta name="twitter:url" content="$socialUrl" />
META;
    } else {
        $socialUrlMeta = '';
    }

    if ($root) {
        $prefix = "";
    } else {
        $prefix = "../";
    }

    $canonicalUrl = 'https://www.ag-grid.com/' . $url;

    echo <<<META
    <script>var dataLayer = [${GLOBALS['GTM_DATA_LAYER']}]</script>
    ${GLOBALS['GTM_SCRIPT']}
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no" />
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css" />

    <title>$title</title>
    <link rel="canonical" href="$canonicalUrl" />

    <meta name="description" content="$description" />
    <meta name="keywords" content="$keywords" />

    <meta property="og:type" content="website" />
    <meta property="og:title" content="$title" />
    <meta property="og:description" content="$description" />

    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="@ag_grid" />
    <meta name="twitter:title" content="$title" />
    <meta name="twitter:description" content="$description" />

    $socialUrlMeta
    $socialImageMeta

    <link rel="icon" type="image/png" sizes="196x196" href="{$prefix}_assets/favicons/favicon-196.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="{$prefix}_assets/favicons/favicon-192.png" />
    <link rel="icon" type="image/png" sizes="180x180" href="{$prefix}_assets/favicons/favicon-180.png" />
    <link rel="icon" type="image/png" sizes="167x167" href="{$prefix}_assets/favicons/favicon-167.png" />
    <link rel="icon" type="image/png" sizes="152x152" href="{$prefix}_assets/favicons/favicon-152.png" />
    <link rel="icon" type="image/png" sizes="128x128" href="{$prefix}_assets/favicons/favicon-128.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="{$prefix}_assets/favicons/favicon-32.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="{$prefix}_assets/favicons/favicon-180-touch.png" />
    <link rel="apple-touch-icon" sizes="167x167" href="{$prefix}_assets/favicons/favicon-167-touch.png" />
    <link rel="apple-touch-icon" sizes="152x152" href="{$prefix}_assets/favicons/favicon-152-touch.png" />
META;
}

function globalAgGridScript($enterprise = false)
{
    $archiveMatch = '/archive\/\d+.\d+.\d+/';
    $host = isset($_SERVER['HTTP_X_PROXY_HTTP_HOST']) ? $_SERVER['HTTP_X_PROXY_HTTP_HOST'] : $_SERVER['HTTP_HOST'] ? $_SERVER['HTTP_HOST'] : 'localhost:8080';

    if (preg_match($archiveMatch, $_SERVER['PHP_SELF'], $matches)) {
        $archiveSegment = $matches[0];
        $prefix = "//$host/$archiveSegment/dev";
    } else {
        $prefix = "//$host/dev";
    }

    if (AG_GRID_VERSION == '$$GRID_VERSION$$') {
        $communityPath = "$prefix/@ag-grid-community/all-modules/dist/ag-grid-community.js";
        $enterprisePath = "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js";

        $cssPaths = [
            "$prefix/@ag-grid-community/all-modules/dist/styles/ag-grid.css",
            "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-alpine-dark.css",
            "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css",
            "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark.css",
            "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css",
            "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-material.css",
            "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-fresh.css",
            "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-dark.css",
            "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-blue.css",
            "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-bootstrap.css"
        ];

        foreach ($cssPaths as $cssLink) {
            echo "    <link rel=\"stylesheet\" href=\"$cssLink\">\n";
        }
    } else {
        $communityPath = "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/ag-grid-community.min.js";
        $enterprisePath = "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_VERSION . "/dist/ag-grid-enterprise.min.js";
    }

    $path = $enterprise ? $enterprisePath : $communityPath;
    return "    <script src=\"$path\"></script>";
}
