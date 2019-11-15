<?php
include dirname(__FILE__) . '/../config.php';

define('USE_LOCAL', AG_GRID_VERSION == '$$LOCAL$$');
$archiveMatch = '/archive\/\d+.\d+.\d+/';

if (isset($_SERVER['HTTP_X_PROXY_HTTP_HOST'])) {
    $host = $_SERVER['HTTP_X_PROXY_HTTP_HOST'];
} else {
    $host = $_SERVER['HTTP_HOST'];
}

if (preg_match($archiveMatch, $_SERVER['PHP_SELF'], $matches)) {
    $archiveSegment = $matches[0];
    $prefix = "//$host/$archiveSegment/dev";
    define('RUNNER_SOURCE_PREFIX', "/$archiveSegment");
    define('POLYMER_BASE_HREF_PREFIX', "//$host/$archiveSegment/");
} else {
    $prefix = "//$host/dev";
    define('RUNNER_SOURCE_PREFIX', "");
    define('POLYMER_BASE_HREF_PREFIX', "//$host/");
}

if (USE_LOCAL) {
    // plain js examples that require old skool umd bundles
    define('AG_GRID_CSS_PATHS', array(
        "$prefix/@ag-grid-community/all-modules/dist/styles/ag-grid.css",
        "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-alpine-dark.css",
        "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css",
        "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark.css",
        "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css",
        "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-blue.css",
        "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-bootstrap.css",
        "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-dark.css",
        "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-fresh.css",
        "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-material.css"
    ));
    define('AG_GRID_SCRIPT_PATH', "$prefix/@ag-grid-community/all-modules/dist/ag-grid-community.js");
    define('AG_GRID_ENTERPRISE_SCRIPT_PATH', "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js");

    $systemJsMap = array(
        /* START OF CSS DEV - DO NOT DELETE */
        "@ag-grid-community/all-modules/dist/styles/ag-grid.css" => "$prefix/@ag-grid-community/all-modules/dist/styles/ag-grid.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-alpine-dark.css" => "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-alpine-dark.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css" => "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark.css" => "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css" => "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-blue.css" => "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-blue.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-bootstrap.css" => "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-bootstrap.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-dark.css" => "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-dark.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-fresh.css" => "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-fresh.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-material.css" => "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-material.css",
        /* END OF CSS DEV - DO NOT DELETE */
        /* START OF MODULES DEV - DO NOT DELETE */
        "@ag-grid-community/all-modules" => "$prefix/@ag-grid-community/all-modules",
        "@ag-grid-community/client-side-row-model" => "$prefix/@ag-grid-community/client-side-row-model",
        "@ag-grid-community/core" => "$prefix/@ag-grid-community/core",
        "@ag-grid-community/csv-export" => "$prefix/@ag-grid-community/csv-export",
        "@ag-grid-community/infinite-row-model" => "$prefix/@ag-grid-community/infinite-row-model",
        "@ag-grid-enterprise/all-modules" => "$prefix/@ag-grid-enterprise/all-modules",
        "@ag-grid-enterprise/charts" => "$prefix/@ag-grid-enterprise/charts",
        "@ag-grid-enterprise/clipboard" => "$prefix/@ag-grid-enterprise/clipboard",
        "@ag-grid-enterprise/column-tool-panel" => "$prefix/@ag-grid-enterprise/column-tool-panel",
        "@ag-grid-enterprise/core" => "$prefix/@ag-grid-enterprise/core",
        "@ag-grid-enterprise/excel-export" => "$prefix/@ag-grid-enterprise/excel-export",
        "@ag-grid-enterprise/filter-tool-panel" => "$prefix/@ag-grid-enterprise/filter-tool-panel",
        "@ag-grid-enterprise/master-detail" => "$prefix/@ag-grid-enterprise/master-detail",
        "@ag-grid-enterprise/menu" => "$prefix/@ag-grid-enterprise/menu",
        "@ag-grid-enterprise/range-selection" => "$prefix/@ag-grid-enterprise/range-selection",
        "@ag-grid-enterprise/rich-select" => "$prefix/@ag-grid-enterprise/rich-select",
        "@ag-grid-enterprise/row-grouping" => "$prefix/@ag-grid-enterprise/row-grouping",
        "@ag-grid-enterprise/server-side-row-model" => "$prefix/@ag-grid-enterprise/server-side-row-model",
        "@ag-grid-enterprise/set-filter" => "$prefix/@ag-grid-enterprise/set-filter",
        "@ag-grid-enterprise/side-bar" => "$prefix/@ag-grid-enterprise/side-bar",
        "@ag-grid-enterprise/status-bar" => "$prefix/@ag-grid-enterprise/status-bar",
        "@ag-grid-enterprise/viewport-row-model" => "$prefix/@ag-grid-enterprise/viewport-row-model",
        /* END OF MODULES DEV - DO NOT DELETE */
        "@ag-grid-community/react" => "$prefix/@ag-grid-community/react",
        "@ag-grid-community/angular" => "$prefix/@ag-grid-community/angular",
        "@ag-grid-community/vue" => "$prefix/@ag-grid-community/vue"
    );

    $systemJsCommunityPaths = array(
        /* START OF COMMUNITY MODULES PATHS DEV - DO NOT DELETE */
        "@ag-grid-community/all-modules" => "$prefix/@ag-grid-community/all-modules/dist/ag-grid-community.cjs.js",
        "@ag-grid-community/client-side-row-model" => "$prefix/@ag-grid-community/all-modules/dist/ag-grid-community.cjs.js",
        "@ag-grid-community/core" => "$prefix/@ag-grid-community/all-modules/dist/ag-grid-community.cjs.js",
        "@ag-grid-community/csv-export" => "$prefix/@ag-grid-community/all-modules/dist/ag-grid-community.cjs.js",
        "@ag-grid-community/infinite-row-model" => "$prefix/@ag-grid-community/all-modules/dist/ag-grid-community.cjs.js",
        /* END OF COMMUNITY MODULES PATHS DEV - DO NOT DELETE */
    );
    $systemJsEnterprisePaths = array(
        /* START OF ENTERPRISE MODULES PATHS DEV - DO NOT DELETE */
        "@ag-grid-community/all-modules" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-community/client-side-row-model" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-community/core" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-community/csv-export" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-community/infinite-row-model" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/all-modules" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/charts" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/clipboard" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/column-tool-panel" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/core" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/excel-export" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/filter-tool-panel" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/master-detail" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/menu" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/range-selection" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/rich-select" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/row-grouping" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/server-side-row-model" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/set-filter" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/side-bar" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/status-bar" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/viewport-row-model" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        /* END OF ENTERPRISE MODULES PATHS DEV - DO NOT DELETE */
    );
// production mode, return from unpkg
} else {
    define('AG_GRID_SCRIPT_PATH', "https://unpkg.com/ag-grid-community@" . AG_GRID_VERSION . "/dist/ag-grid-community.min.js");
    define('AG_GRID_ENTERPRISE_SCRIPT_PATH', "https://unpkg.com/ag-grid-enterprise@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.min.js");

    $systemJsMap = array(
        /* START OF CSS PROD - DO NOT DELETE */
        "@ag-grid-community/all-modules/dist/styles/ag-grid.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/ag-grid.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-alpine-dark.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/ag-theme-alpine-dark.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/ag-theme-alpine.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/ag-theme-balham-dark.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/ag-theme-balham.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-blue.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/ag-theme-blue.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-bootstrap.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/ag-theme-bootstrap.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-dark.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/ag-theme-dark.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-fresh.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/ag-theme-fresh.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-material.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/ag-theme-material.css",
        /* END OF CSS PROD - DO NOT DELETE */
        /* START OF MODULES PROD - DO NOT DELETE */
        "@ag-grid-community/all-modules" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/",
        "@ag-grid-community/client-side-row-model" => "https://unpkg.com/@ag-grid-community/client-side-row-model@" . AG_GRID_VERSION . "/",
        "@ag-grid-community/core" => "https://unpkg.com/@ag-grid-community/core@" . AG_GRID_VERSION . "/",
        "@ag-grid-community/csv-export" => "https://unpkg.com/@ag-grid-community/csv-export@" . AG_GRID_VERSION . "/",
        "@ag-grid-community/infinite-row-model" => "https://unpkg.com/@ag-grid-community/infinite-row-model@" . AG_GRID_VERSION . "/",
        "@ag-grid-enterprise/all-modules" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-grid-enterprise/charts" => "https://unpkg.com/@ag-grid-enterprise/charts@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-grid-enterprise/clipboard" => "https://unpkg.com/@ag-grid-enterprise/clipboard@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-grid-enterprise/column-tool-panel" => "https://unpkg.com/@ag-grid-enterprise/column-tool-panel@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-grid-enterprise/core" => "https://unpkg.com/@ag-grid-enterprise/core@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-grid-enterprise/excel-export" => "https://unpkg.com/@ag-grid-enterprise/excel-export@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-grid-enterprise/filter-tool-panel" => "https://unpkg.com/@ag-grid-enterprise/filter-tool-panel@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-grid-enterprise/master-detail" => "https://unpkg.com/@ag-grid-enterprise/master-detail@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-grid-enterprise/menu" => "https://unpkg.com/@ag-grid-enterprise/menu@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-grid-enterprise/range-selection" => "https://unpkg.com/@ag-grid-enterprise/range-selection@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-grid-enterprise/rich-select" => "https://unpkg.com/@ag-grid-enterprise/rich-select@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-grid-enterprise/row-grouping" => "https://unpkg.com/@ag-grid-enterprise/row-grouping@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-grid-enterprise/server-side-row-model" => "https://unpkg.com/@ag-grid-enterprise/server-side-row-model@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-grid-enterprise/set-filter" => "https://unpkg.com/@ag-grid-enterprise/set-filter@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-grid-enterprise/side-bar" => "https://unpkg.com/@ag-grid-enterprise/side-bar@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-grid-enterprise/status-bar" => "https://unpkg.com/@ag-grid-enterprise/status-bar@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-grid-enterprise/viewport-row-model" => "https://unpkg.com/@ag-grid-enterprise/viewport-row-model@" . AG_GRID_ENTERPRISE_VERSION . "/",
        /* END OF MODULES PROD - DO NOT DELETE */
        "@ag-grid-community/react" => "npm:@ag-grid-community/react@" . AG_GRID_REACT_VERSION . "/",
        "@ag-grid-community/angular" => "npm:@ag-grid-community/angular@" . AG_GRID_ANGULAR_VERSION . "/",
        "@ag-grid-community/vue" => "npm:@ag-grid-community/vue@" . AG_GRID_VUE_VERSION . "/"
    );

    $systemJsCommunityPaths = array(
        /* START OF COMMUNITY MODULES PATHS PROD - DO NOT DELETE */
        "@ag-grid-community/all-modules" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/ag-grid-community.cjs.js",
        "@ag-grid-community/client-side-row-model" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/ag-grid-community.cjs.js",
        "@ag-grid-community/core" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/ag-grid-community.cjs.js",
        "@ag-grid-community/csv-export" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/ag-grid-community.cjs.js",
        "@ag-grid-community/infinite-row-model" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/ag-grid-community.cjs.js",
        /* END OF COMMUNITY MODULES PATHS PROD - DO NOT DELETE */
    );
    $systemJsEnterprisePaths = array(
        /* START OF ENTERPRISE MODULES PATHS PROD - DO NOT DELETE */
        "@ag-grid-community/all-modules" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-community/client-side-row-model" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-community/core" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-community/csv-export" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-community/infinite-row-model" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/all-modules" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/charts" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/clipboard" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/column-tool-panel" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/core" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/excel-export" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/filter-tool-panel" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/master-detail" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/menu" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/range-selection" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/rich-select" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/row-grouping" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/server-side-row-model" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/set-filter" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/side-bar" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/status-bar" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/viewport-row-model" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        /* END OF ENTERPRISE MODULES PATHS PROD - DO NOT DELETE */
    );
}

function getLocalCssIfApplicable()
{
    $result = '';
    if (AG_GRID_CSS_PATHS) {
        foreach (AG_GRID_CSS_PATHS as $cssLink) {
            $result = $result."<link rel='stylesheet' href='$cssLink'>";
        }
    }
    return $result;
}

function globalAgGridScript($enterprise = false, $lazyLoad = false)
{
    $localCss = getLocalCssIfApplicable();
    echo $localCss;
    $path = $enterprise ? AG_GRID_ENTERPRISE_SCRIPT_PATH : AG_GRID_SCRIPT_PATH;
    if ($lazyLoad) {
        return "<script id='ag-grid-script' src='$path' defer='true' async='true'></script>";//.$localCss;
    } else {
        return "<script src='$path'></script>";//.$localCss;
    }
}


function path_combine(...$parts)
{
    return join("/", $parts);
}

function moveIndexFirst($a, $b)
{
    if ($a == "index.html") {
        return -1;
    } elseif ($b == "index.html") {
        return 1;
    } else {
        return strcmp($a, $b);
    }
}

function getDirContents($dir, $skipDirs = array(), &$results = array(), $prefix = "")
{
    $files = scandir($dir);

    usort($files, 'moveIndexFirst');

    foreach ($files as $key => $value) {
        $path = realpath($dir . "/" . $value);

        $skipEntry = is_dir($path) && in_array($value, $skipDirs);
        if (!$skipEntry) {
            if (substr($value, 0, 1) == ".") {
                continue;
            }

            if (!is_dir($path)) {
                $results[] = $prefix . $value;
            } else if ($value != "." && $value != "..") {
                getDirContents($path, $skipDirs, $results, $prefix . $value . "/");
            }
        }
    }

    return $results;
}

function toQueryString($key, $value)
{
    $value = urlencode($value);
    return "$key=$value";
}

function moveVanillaFirst($a, $b)
{
    if ($a == "vanilla") {
        return -1;
    } elseif ($b == "vanilla") {
        return 1;
    } else {
        return strcmp($a, $b);
    }
}

function getTypes($dir)
{
    $types = array();
    $files = scandir($dir);
    foreach ($files as $file) {
        if (substr($file, 0, 1) == ".") {
            continue;
        }
        if (is_dir(realpath($dir . "/" . $file))) {
            $types[] = $file;
        }
    }

    usort($types, 'moveVanillaFirst');

    return $types;
}

function example($title, $dir, $type = 'vanilla', $options = array())
{
    $options['skipDirs'] = $options['skipDirs'] ? $options['skipDirs'] : array();

    $packaged = strrpos($type, "-packaged") !== false;
    if ($packaged) {
        $type = 'as-is';
        array_push($options['skipDirs'], 'prebuilt');
        $options['usePath'] = '/prebuilt/';
        $options['noPlunker'] = 1;
    }

    $section = basename(dirname($_SERVER['SCRIPT_NAME']));
    $multi = $type === 'multi';
    $generated = $type === 'generated';


    $config = array(
        'type' => $type,
        'name' => $dir,
        'section' => $section,
        'types' => array(),
        'title' => $title,
        'sourcePrefix' => RUNNER_SOURCE_PREFIX,
        'options' => $options
    );

    if ($generated) {
        $types = array('vanilla', 'angular', 'react', 'vue');
    } else if ($multi) {
        $types = getTypes($dir);
    } else {
        $types = [$type];
    }

    $query = array(
        "section" => $section,
        "example" => $dir
    );

    if ($options['extras']) {
        foreach ($options['extras'] as $extra) {
            $query[$extra] = "1";
        }
    }

    if ($options['enterprise']) {
        $query['enterprise'] = true;
    }

    if ($options['noStyle']) {
        $query['noStyle'] = true;
    }

    if ($options['usePath']) {
        $query['usePath'] = $options['usePath'];
    }

    if ($multi) {
        $query['multi'] = 1;
    }

    if ($generated) {
        $query['generated'] = 1;
    }

    $gridSettings = array(
        'noStyle' => $options['noStyle'] ? $options['noStyle'] : 0,
        'height' => '100%',
        'width' => '100%',
        'enterprise' => $options['enterprise']
    );

    if (isset($options['grid'])) {
        $gridSettings = array_merge($gridSettings, $options['grid']);
    }

    $config['options']['grid'] = $gridSettings;

    $query['grid'] = json_encode($gridSettings);

    $queryString = join("&", array_map('toQueryString', array_keys($query), $query));

    foreach ($types as $theType) {
        $entry = array();
        if ($multi) {
            $entry['files'] = getDirContents($dir . "/" . $theType);
        } else if ($generated) {
            $entry['files'] = getDirContents($dir . "/_gen/" . $theType);
        } else {
            $entry['files'] = getDirContents($dir, $options['skipDirs']);
        }

        if ($theType != "vanilla" && $theType != "as-is") {
            $entry['boilerplatePath'] = "../example-runner/$theType-boilerplate";
            $entry['boilerplateFiles'] = getDirContents($entry['boilerplatePath']);
        }

        $entry['resultUrl'] = "../example-runner/$theType.php?$queryString";

        $config['types'][$theType] = $entry;
    }

    $jsonConfig = htmlspecialchars(json_encode($config));

    return <<<NG
    <example-runner config="$jsonConfig"></example-runner>
NG;
}

function packagedExample($title, $dir, $type = 'vanilla', $options = array())
{
    $section = basename(dirname($_SERVER['SCRIPT_NAME']));
    $multi = $type === 'multi';
    $generated = $type === 'generated';

    $options['skipDirs'] = $options['skipDirs'] ? $options['skipDirs'] : array();

    $config = array(
        'type' => $type,
        'name' => $dir,
        'section' => $section,
        'types' => array(),
        'title' => $title,
        'sourcePrefix' => RUNNER_SOURCE_PREFIX,
        'options' => $options
    );

    if ($generated) {
        $types = array('vanilla', 'angular', 'react', 'vue');
    } else if ($multi) {
        $types = getTypes($dir);
    } else {
        $types = [$type];
    }

    $query = array(
        "section" => $section,
        "example" => $dir
    );

    if ($options['extras']) {
        foreach ($options['extras'] as $extra) {
            $query[$extra] = "1";
        }
    }

    if ($options['enterprise']) {
        $query['enterprise'] = true;
    }

    if ($options['noStyle']) {
        $query['noStyle'] = true;
    }

    if ($options['usePath']) {
        $query['usePath'] = $options['usePath'];
    }

    if ($multi) {
        $query['multi'] = 1;
    }

    if ($generated) {
        $query['generated'] = 1;
    }

    $gridSettings = array(
        'noStyle' => $options['noStyle'] ? $options['noStyle'] : 0,
        'height' => '100%',
        'width' => '100%',
        'enterprise' => $options['enterprise']
    );

    if (isset($options['grid'])) {
        $gridSettings = array_merge($gridSettings, $options['grid']);
    }

    $config['options']['grid'] = $gridSettings;

    $query['grid'] = json_encode($gridSettings);

    $queryString = join("&", array_map('toQueryString', array_keys($query), $query));

    foreach ($types as $theType) {
        $entry = array();
        if ($multi) {
            $entry['files'] = getDirContents($dir . "/" . $theType);
        } else if ($generated) {
            $entry['files'] = getDirContents($dir . "/_gen/" . $theType);
        } else {
            $entry['files'] = getDirContents($dir, $options['skipDirs']);
        }

        if ($theType != "vanilla" && $theType != "as-is") {
            $entry['boilerplatePath'] = "../example-runner/$theType-boilerplate";
            $entry['boilerplateFiles'] = getDirContents($entry['boilerplatePath']);
        }

        $entry['resultUrl'] = "../example-runner/$theType.php?$queryString";

        $config['types'][$theType] = $entry;
    }

    $jsonConfig = htmlspecialchars(json_encode($config));

    return <<<NG
    <example-runner config="$jsonConfig"></example-runner>
NG;
}

function preview($title, $name, $url, $sourceCodeUrl, $options = array())
{
    $jsonOptions = json_encode($options);

    return <<<NG
    <preview
        title="'$title'"
        name="'$name'"
        result-url="'$url'"
        source-code-url="'$sourceCodeUrl'"
        options='$jsonOptions'
        $additional
        >
    </preview>
NG;
}

// helpers in the example render, shared between angular and react
function renderStyles($styles)
{
    foreach ($styles as $style) {
        echo '    <link rel="stylesheet" href="' . $style . '">' . "\n";
    }
}

// helpers in the example render, shared between angular, react & vue
function renderNonGeneratedScripts($scripts, $skip_main = FALSE)
{
    foreach ($scripts as $script) {
        if ($script === 'main.js' && $skip_main === TRUE) {
            continue;
        }
        echo '    <script src="' . $script . '"></script>' . "\n";
    }
}

function filterByExt($files, $root, $preview, $ext)
{
    $matching = array();
    foreach ($files as $file) {
        $path = path_combine($root, $file);
        $info = pathinfo($path);

        if ($info['extension'] == $ext) {
            $matching[] = $preview ? $file : $path;
        }
    }

    return $matching;
}

function getStyles($files, $root, $preview)
{
    return filterByExt($files, $root, $preview, 'css');
}

function getScripts($files, $root, $preview)
{
    return filterByExt($files, $root, $preview, 'js');
}

function getDocuments($files, $root, $preview)
{
    return filterByExt($files, $root, $preview, 'html');
}

function getGridSettings()
{
    return json_decode($_GET['grid'], true);
}

function getExampleInfo($boilerplatePrefix)
{
    $preview = isset($_GET['preview']);
    $multi = isset($_GET['multi']);
    $generated = isset($_GET['generated']);

    $exampleDir = basename($_GET['example']);
    $exampleSection = basename($_GET['section']);

    if ($multi) {
        $appRoot = path_combine('..', $exampleSection, $exampleDir, $boilerplatePrefix);
    } else if ($generated) {
        $appRoot = path_combine('..', $exampleSection, $exampleDir, '_gen', $boilerplatePrefix);
    } else {
        $appRoot = path_combine('..', $exampleSection, $exampleDir);
    }

    $files = getDirContents($appRoot);

    $styles = getStyles($files, $appRoot, $preview);
    $scripts = getScripts($files, $appRoot, $preview);
    $documents = getDocuments($files, $appRoot, $preview);

    if ($preview) {
        $boilerplatePath = "";
        $appLocation = "";
    } else {
        $boilerplatePath = "$boilerplatePrefix-boilerplate/";
        $appLocation = $appRoot . "/";
    }

    return array(
        "preview" => $preview,
        "boilerplatePath" => $boilerplatePath,
        "appLocation" => $appLocation,
        "agGridScriptPath" => AG_GRID_SCRIPT_PATH,
        "styles" => $styles,
        "scripts" => $scripts,
        "documents" => $documents,
        "gridSettings" => getGridSettings()
    );
}

function renderExampleExtras($config)
{


    // bootstrap script wants jQuery
    if ($config['bootstrap']) {
        $config['jquery'] = 1;
    }

    // jQuery UI wants jQuery
    if ($config['jqueryui']) {
        $config['jquery'] = 1;
    }

    /* !!!!  IF YOU UPDATE THIS PLEASE UPDATE packaged-example-builder.js */
    $extras = array(
        'xlsx' => array(
            'scripts' => array(
                'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.10.3/xlsx.core.min.js'
            )
        ),
        'jquery' => array(
            'scripts' => array('https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.1/jquery.min.js')
        ),
        'jqueryui' => array(
            'scripts' => array('https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js'),
            'styles' => array('https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css')
        ),
        'rxjs' => array(
            'scripts' => array('https://cdnjs.cloudflare.com/ajax/libs/rxjs/5.4.0/Rx.min.js')
        ),
        'lodash' => array(
            'scripts' => array('https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js')
        ),
        'd3' => array(
            'scripts' => array('https://d3js.org/d3.v4.min.js')
        ),
        'sparkline' => array(
            'scripts' => array('https://cdnjs.cloudflare.com/ajax/libs/jquery-sparklines/2.1.2/jquery.sparkline.min.js')
        ),
        'bootstrap' => array(
            'scripts' => array('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js'),
            'styles' => array(
                'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css',
                'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap-theme.min.css'
            )
        ),
        'flatpickr' => array(
            'scripts' => array('https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.5.2/flatpickr.min.js'),
            'styles' => array(
                'https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.5.2/flatpickr.min.css',
                'https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.5.2/themes/material_blue.css'
            )
        ),
        'roboto' => array(
            'styles' => array(
                'https://fonts.googleapis.com/css?family=Roboto'
            )
        ),
        'fontawesome' => array(
            'styles' => array('https://use.fontawesome.com/releases/v5.6.3/css/all.css')
        ),
        'xlsx-style' => array(
            'scripts' => array('https://unpkg.com/xlsx-style@0.8.13/dist/xlsx.full.min.js')
        ),
        'angularjs1' => array(
            'scripts' => array(
                'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.1/angular.min.js'
            )
        ),
        'ui-bootstrap' => array(
            'scripts' => array(
                '//angular-ui.github.io/bootstrap/ui-bootstrap-tpls-2.5.0.js'
            ),
            'styles' => array(
                '//netdna.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'
            )
        ),
        'materialdesign' => array(
            'styles' => array(
                'https://unpkg.com/@angular/material/prebuilt-themes/indigo-pink.css',
                'https://fonts.googleapis.com/icon?family=Material+Icons'
            )
        ),
        'ngx-bootstrap' => array(
            'styles' => array(
                'https://unpkg.com/bootstrap/dist/css/bootstrap.min.css'
            )
        )
    );

    foreach ($extras as $lib => $resources) {
        if (isset($config[$lib])) {
            if (isset($resources['styles'])) {
                foreach ($resources['styles'] as $style) {
                    echo "    ";
                    echo '<link rel="stylesheet" href="' . $style . '"/>';
                    echo "\n";
                }
            }

            if (isset($resources['scripts'])) {
                foreach ($resources['scripts'] as $script) {
                    echo "\t";
                    echo '<script src="' . $script . '"></script>';
                    echo "\n";
                }
            }
        }
    }
}

?>
