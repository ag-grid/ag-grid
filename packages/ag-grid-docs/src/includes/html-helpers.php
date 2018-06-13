<?php
$GTM_SCRIPT = <<<SCRIPT
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TW77RR3');</script>
<!-- End Google Tag Manager -->
SCRIPT;

$GTM_DATA_LAYER = json_encode(array('default' => true));

$LINKEDIN_SCRIPT = <<<SCRIPT
<script type="text/javascript"> _linkedin_data_partner_id = "302985"; </script><script type="text/javascript"> (function(){var s = document.getElementsByTagName("script")[0]; var b = document.createElement("script"); b.type = "text/javascript";b.async = true; b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js"; s.parentNode.insertBefore(b, s);})(); </script> <noscript> <img height="1" width="1" style="display:none;" alt="" src="https://dc.ads.linkedin.com/collect/?pid=302985&fmt=gif" /> </noscript>
SCRIPT;

$GOOGLE_ADS = <<<SCRIPT
<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<script>
 (adsbygoogle = window.adsbygoogle || []).push({
   google_ad_client: "ca-pub-1469890206560730",
   enable_page_level_ads: true
 });
</script>
SCRIPT;

function gtm_data_layer($pageCategory, $additional = array()) {
    $additional['pageCategory'] = $pageCategory;
    $GLOBALS['GTM_DATA_LAYER'] = json_encode($additional);
}


function meta_and_links($title, $keywords, $description, $root = false) {
    $font_awesome = $GLOBALS['DONT_USE_FONT_AWESOME']
        ? ""
        : '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">';

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
    <script>var dataLayer = [${GLOBALS['GTM_DATA_LAYER']}]</script>
    ${GLOBALS['GTM_SCRIPT']}
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
    <!-- link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,900" rel="stylesheet" -->
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
    ${GLOBALS['LINKEDIN_SCRIPT']}
    ${GLOBALS['GOOGLE_ADS']}
META;
}

function docScripts() {
    echo <<<SCRIPT
<script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.5/angular.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.5/angular-cookies.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/algoliasearch/3.24.9/algoliasearch.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/autocomplete.js/0.29.0/autocomplete.min.js"></script>

<script src="../documentation-main/documentation.js"></script>
<script src="../dist/docs.js"></script>
SCRIPT;
}
?>


