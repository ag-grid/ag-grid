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
    define('AG_GRID_SCRIPT_PATH', "$prefix/@ag-community/grid-all-modules/dist/ag-grid-community.js");
    define('AG_GRID_ENTERPRISE_SCRIPT_PATH', "$prefix/@ag-enterprise/grid-all-modules/dist/ag-grid-enterprise.js");

    $systemJsMap = array(
        /* START OF MODULES DEV - DO NOT DELETE */
        "@ag-community/grid-all-modules" => "$prefix/@ag-community/grid-all-modules",
        "@ag-community/grid-client-side-row-model" => "$prefix/@ag-community/grid-client-side-row-model",
        "@ag-community/grid-core" => "$prefix/@ag-community/grid-core",
        "@ag-community/grid-csv-export" => "$prefix/@ag-community/grid-csv-export",
        "@ag-community/grid-infinite-row-model" => "$prefix/@ag-community/grid-infinite-row-model",
        "@ag-enterprise/grid-all-modules" => "$prefix/@ag-enterprise/grid-all-modules",
        "@ag-enterprise/grid-charts" => "$prefix/@ag-enterprise/grid-charts",
        "@ag-enterprise/grid-clipboard" => "$prefix/@ag-enterprise/grid-clipboard",
        "@ag-enterprise/grid-column-tool-panel" => "$prefix/@ag-enterprise/grid-column-tool-panel",
        "@ag-enterprise/grid-core" => "$prefix/@ag-enterprise/grid-core",
        "@ag-enterprise/grid-excel-export" => "$prefix/@ag-enterprise/grid-excel-export",
        "@ag-enterprise/grid-filter-tool-panel" => "$prefix/@ag-enterprise/grid-filter-tool-panel",
        "@ag-enterprise/grid-master-detail" => "$prefix/@ag-enterprise/grid-master-detail",
        "@ag-enterprise/grid-menu" => "$prefix/@ag-enterprise/grid-menu",
        "@ag-enterprise/grid-range-selection" => "$prefix/@ag-enterprise/grid-range-selection",
        "@ag-enterprise/grid-rich-select" => "$prefix/@ag-enterprise/grid-rich-select",
        "@ag-enterprise/grid-row-grouping" => "$prefix/@ag-enterprise/grid-row-grouping",
        "@ag-enterprise/grid-server-side-row-model" => "$prefix/@ag-enterprise/grid-server-side-row-model",
        "@ag-enterprise/grid-set-filter" => "$prefix/@ag-enterprise/grid-set-filter",
        "@ag-enterprise/grid-side-bar" => "$prefix/@ag-enterprise/grid-side-bar",
        "@ag-enterprise/grid-status-bar" => "$prefix/@ag-enterprise/grid-status-bar",
        "@ag-enterprise/grid-viewport-row-model" => "$prefix/@ag-enterprise/grid-viewport-row-model",
        /* END OF MODULES DEV - DO NOT DELETE */
        "@ag-community/grid-react" => "$prefix/@ag-community/grid-react",
        "@ag-community/grid-angular" => "$prefix/@ag-community/grid-angular",
        "@ag-community/grid-vue" => "$prefix/@ag-community/grid-vue"
    );
// production mode, return from unpkg
} else {
    define('AG_GRID_SCRIPT_PATH', "https://unpkg.com/ag-grid-community@" . AG_GRID_VERSION . "/dist/ag-grid-community.min.js");
    define('AG_GRID_ENTERPRISE_SCRIPT_PATH', "https://unpkg.com/ag-grid-enterprise@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.min.js");

    $systemJsMap = array(
        // spl modules test prior to release!
        /* START OF MODULES PROD - DO NOT DELETE */
        "@ag-community/grid-all-modules" => "https://unpkg.com/@ag-community/grid-all-modules@" . AG_GRID_VERSION . "/",
        "@ag-community/grid-client-side-row-model" => "https://unpkg.com/@ag-community/grid-client-side-row-model@" . AG_GRID_VERSION . "/",
        "@ag-community/grid-core" => "https://unpkg.com/@ag-community/grid-core@" . AG_GRID_VERSION . "/",
        "@ag-community/grid-csv-export" => "https://unpkg.com/@ag-community/grid-csv-export@" . AG_GRID_VERSION . "/",
        "@ag-community/grid-infinite-row-model" => "https://unpkg.com/@ag-community/grid-infinite-row-model@" . AG_GRID_VERSION . "/",
        "@ag-enterprise/grid-all-modules" => "https://unpkg.com/@ag-enterprise/grid-all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-enterprise/grid-charts" => "https://unpkg.com/@ag-enterprise/grid-charts@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-enterprise/grid-clipboard" => "https://unpkg.com/@ag-enterprise/grid-clipboard@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-enterprise/grid-column-tool-panel" => "https://unpkg.com/@ag-enterprise/grid-column-tool-panel@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-enterprise/grid-core" => "https://unpkg.com/@ag-enterprise/grid-core@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-enterprise/grid-excel-export" => "https://unpkg.com/@ag-enterprise/grid-excel-export@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-enterprise/grid-filter-tool-panel" => "https://unpkg.com/@ag-enterprise/grid-filter-tool-panel@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-enterprise/grid-master-detail" => "https://unpkg.com/@ag-enterprise/grid-master-detail@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-enterprise/grid-menu" => "https://unpkg.com/@ag-enterprise/grid-menu@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-enterprise/grid-range-selection" => "https://unpkg.com/@ag-enterprise/grid-range-selection@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-enterprise/grid-rich-select" => "https://unpkg.com/@ag-enterprise/grid-rich-select@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-enterprise/grid-row-grouping" => "https://unpkg.com/@ag-enterprise/grid-row-grouping@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-enterprise/grid-server-side-row-model" => "https://unpkg.com/@ag-enterprise/grid-server-side-row-model@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-enterprise/grid-set-filter" => "https://unpkg.com/@ag-enterprise/grid-set-filter@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-enterprise/grid-side-bar" => "https://unpkg.com/@ag-enterprise/grid-side-bar@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-enterprise/grid-status-bar" => "https://unpkg.com/@ag-enterprise/grid-status-bar@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "@ag-enterprise/grid-viewport-row-model" => "https://unpkg.com/@ag-enterprise/grid-viewport-row-model@" . AG_GRID_ENTERPRISE_VERSION . "/",
        /* END OF MODULES PROD - DO NOT DELETE */
        "@ag-community/grid-react" => "npm:@ag-community/grid-react@" . AG_GRID_REACT_VERSION . "/",
        "@ag-community/grid-angular" => "npm:@ag-community/grid-angular@" . AG_GRID_ANGULAR_VERSION . "/",
        "@ag-community/grid-vue" => "npm:@ag-community/grid-vue@" . AG_GRID_VUE_VERSION . "/"
    );
}

function globalAgGridScript($enterprise = false, $lazyLoad = false)
{
    $path = $enterprise ? AG_GRID_ENTERPRISE_SCRIPT_PATH : AG_GRID_SCRIPT_PATH;
    if ($lazyLoad) {
     return <<<SCR
    <script id="ag-grid-script" src="$path" defer="true" async="true"></script>
SCR;

    } else {
     return <<<SCR
    <script src="$path"></script>
SCR;
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

    $packaged = strrpos($type,"-packaged") !== false;
    if($packaged) {
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
        if($script === 'main.js' && $skip_main === TRUE) {
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
