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

    define('AG_GRID_SCRIPT_PATH', "$prefix/ag-grid/dist/ag-grid.js");
    define('AG_GRID_ENTERPRISE_SCRIPT_PATH', "$prefix/ag-grid-enterprise-bundle/ag-grid-enterprise.js");

    $systemJsMap = array(
        "ag-grid" => "$prefix/ag-grid/dist/ag-grid.js",
        "ag-grid/main" => "$prefix/ag-grid/dist/ag-grid.js",
        "ag-grid-enterprise" => "$prefix/ag-grid-enterprise",
        "ag-grid-react" => "$prefix/ag-grid-react",
        "ag-grid-angular" => "$prefix/ag-grid-angular",
        "ag-grid-vue" => "$prefix/ag-grid-vue"
    );
// production mode, return from unpkg
} else {
    define('AG_GRID_SCRIPT_PATH', "https://unpkg.com/ag-grid@" . AG_GRID_VERSION . "/dist/ag-grid.min.js");
    define('AG_GRID_ENTERPRISE_SCRIPT_PATH', "https://unpkg.com/ag-grid-enterprise@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.min.js");

    $systemJsMap = array(
        "ag-grid" => "https://unpkg.com/ag-grid@" . AG_GRID_VERSION . "/dist/ag-grid.js",
        "ag-grid/main" => "https://unpkg.com/ag-grid@" . AG_GRID_VERSION . "/dist/ag-grid.js",
        "ag-grid-enterprise" => "https://unpkg.com/ag-grid-enterprise@" . AG_GRID_ENTERPRISE_VERSION . "/",
        "ag-grid-react" => "npm:ag-grid-react@" . AG_GRID_REACT_VERSION . "/",
        "ag-grid-angular" => "npm:ag-grid-angular@" . AG_GRID_ANGULAR_VERSION . "/",
        "ag-grid-vue" => "npm:ag-grid-vue@" . AG_GRID_VUE_VERSION . "/"
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
        'theme' => 'ag-theme-balham',
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

        if ($theType != "vanilla" && $theType != "polymer" && $theType != "as-is") {
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

// helpers in the example render, shared between angular and react
function renderNonGeneratedScripts($scripts)
{
    foreach ($scripts as $script) {
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
        'roboto' => array(
            'styles' => array(
                'https://fonts.googleapis.com/css?family=Roboto'
            )
        ),
        'fontawesome' => array(
            'styles' => array('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css')
        ),
        'xlsx-style' => array(
            'scripts' => array('https://unpkg.com/xlsx-style@0.8.13/dist/xlsx.full.min.js')
        ),
        'angularjs1' => array(
            'scripts' => array(
                'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular.min.js'
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
