<?php
include dirname(__FILE__) . '/../config.php';

define('INCOMPLETE_ENTERPRISE_BUNDLE', isset($_ENV['AG_DEV']));
define('USE_LOCAL', AG_GRID_VERSION == '$$LOCAL$$');

if (USE_LOCAL) {
    if (preg_match('/archive\/\d.\d.\d/', $_SERVER['PHP_SELF'], $matches)) {
        $archiveSegment = $matches[0];
        $prefix =  "http://{$_SERVER['HTTP_HOST']}/$archiveSegment/dist";
    } else {
        $prefix =  "http://{$_SERVER['HTTP_HOST']}/dist";
    }

    define(AG_GRID_SCRIPT_PATH, "$prefix/ag-grid/ag-grid.js");
    define(AG_GRID_ENTERPRISE_SCRIPT_PATH, "$prefix/ag-grid-enterprise/ag-grid-enterprise.js");

    $systemJsMap = array(
        "ag-grid" =>                       "$prefix/ag-grid/ag-grid.js",
        "ag-grid/main" =>                  "$prefix/ag-grid/ag-grid.js",
        "ag-grid-enterprise" =>            "$prefix/ag-grid-enterprise/ag-grid-enterprise.js",
        "ag-grid-react" =>                 "$prefix/ag-grid-react/ag-grid-react.js",
        // I can't make a bundle for angular , load it from NPM for now. This won't pick the local changes
        // "ag-grid-angular" =>             "http://{$_SERVER['HTTP_HOST']}/dist/ag-grid-angular/ag-grid-angular.js"
        "ag-grid-angular" =>                "npm:ag-grid-angular@13.0.0/main.js"
    );
// production mode, return from unpkg
} else {
    define(AG_GRID_SCRIPT_PATH, "https://unpkg.com/ag-grid@" . AG_GRID_VERSION . "/dist/ag-grid.js");
    define(AG_GRID_ENTERPRISE_SCRIPT_PATH, "https://unpkg.com/ag-grid-enterprise@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.js");

    $systemJsMap = array(
        "ag-grid" =>                        "https://unpkg.com/ag-grid@" . AG_GRID_VERSION . "/dist/ag-grid.js",
        "ag-grid/main" =>                   "https://unpkg.com/ag-grid@" . AG_GRID_VERSION . "/dist/ag-grid.js",
        "ag-grid-enterprise" =>             "https://unpkg.com/ag-grid-enterprise@" . AG_GRID_ENTERPRISE_VERSION . "/main.js",
        "ag-grid-react" =>                  "npm:ag-grid-react@" . AG_GRID_REACT_VERSION . "/main.js",
        "ag-grid-angular" =>                "npm:ag-grid-angular@" . AG_GRID_ANGULAR_VERSION . "/main.js"
    );
}

function globalAgGridScript($enteprise = false) {

$agGrid = AG_GRID_SCRIPT_PATH;
$agGridEnterprise = AG_GRID_ENTERPRISE_SCRIPT_PATH;

    if (!$enteprise) {
        $output = <<<SCR
    <script src="$agGrid"></script>
SCR;
    } else {
        if (INCOMPLETE_ENTERPRISE_BUNDLE) {
            $output = <<<SCR
    <script src="$agGrid"></script>
    <script> window['ag-grid'] = agGrid; </script>
    <script src="$agGridEnterprise"></script>
    <script> agGrid = window['ag-grid']; </script>
SCR;
        } else {
            $output = <<<SCR
    <script src="$agGridEnterprise"></script>
SCR;
        }
    }

    return $output;
}

function path_combine(...$parts) {
    return join("/", $parts);
}

function moveIndexFirst($a, $b) {
    if ($a == "index.html") {
        return -1;
    } elseif ($b == "index.html") {
        return 1;
    } else {
        return strcmp($a, $b);
    }
}

function getDirContents($dir, &$results = array(), $prefix = ""){
    $files = scandir($dir);

    usort($files, 'moveIndexFirst');

    foreach($files as $key => $value){
        $path = realpath($dir."/".$value);

        if (substr($value, 0, 1) == ".") {
            continue;
        }

        if(!is_dir($path)) {
            $results[] = $prefix . $value;
        } else if($value != "." && $value != "..") {
            getDirContents($path, $results, $prefix.$value."/");
        }
    }

    return $results;
}

function getBoilerplateConfig($type) {
    if ($type == "vanilla" || $type == "polymer") {
        return "";
    }

    $boilerplatePath = "../example-runner/$type-boilerplate/";
    $files = htmlspecialchars(json_encode(getDirContents($boilerplatePath)));

    return <<<ATTR
    boilerplate-path="'$boilerplatePath'"
    boilerplate-files="$files"
ATTR;
}

function toQueryString($key, $value) {
    return "$key=$value";
}

function example($title, $dir, $type='vanilla', $options = array()) {
    $fileList = htmlspecialchars(json_encode(getDirContents($dir)));
    $section = basename(dirname($_SERVER['SCRIPT_NAME']));
    $additional = getBoilerplateConfig($type);

    $query = array(
        "section" => $section,
        "example" => $dir
    );

    if ($options['extras']) {
        foreach($options['extras'] as $extra) {
            $query[$extra] = "1";
        }
    }

    if ($options['enterprise']) {
        $query['enterprise'] = true;
    }

    $queryString = join("&", array_map('toQueryString', array_keys($query), $query));

    $resultUrl = "../example-runner/$type.php?$queryString";
    $jsonOptions = json_encode($options);

    return <<<NG
    <example-runner
        type="'$type'"
        name="'$dir'"
        section="'$section'"
        title="'$title'"
        files="$fileList"
        result-url="'$resultUrl'"
        options='$jsonOptions'
        $additional
        >
    </example-runner>
NG;
}

function preview($title, $name, $url, $sourceCodeUrl, $options = array()) {
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
function renderStyles($styles) {
    foreach ($styles as $style) {
        echo '    <link rel="stylesheet" href="'.$style.'">' . "\n";
    }
}

function getStyles($files, $root, $preview) {
    $styles = array();
    foreach ($files as $file) {
        $path = path_combine($root, $file);
        $info = pathinfo($path);

        if ($info['extension'] == 'css') {
            $styles[] = $preview ? $file : $path;
        }
    }

    return $styles;
}

function getExampleInfo($boilerplatePrefix) {
    $exampleDir = basename($_GET['example']);
    $exampleSection = basename($_GET['section']);
    $appRoot = path_combine('..', $exampleSection, $exampleDir);
    $files = getDirContents($appRoot);

    $preview = isset($_GET['preview']);

    $styles = getStyles($files, $appRoot, $preview);

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
        "agGridScriptPath" => AG_SCRIPT_PATH,
        "styles" => $styles
    );
}

function renderExampleExtras($config) {
    $extras = array(
        'jquery' => array(
            'scripts' => array( 'https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.1/jquery.min.js' )
        ),
        'jqueryui' => array(
            'scripts' => array( 'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js' ),
            'styles' => array ( 'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css' )
        ),
        'lodash' => array(
            'scripts' => array( 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js' )
        ),
        'bootstrap' => array(
            'scripts' => array( 'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js' ),
            'styles' => array(
                'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css' ,
                'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap-theme.min.css'
            )
        ),
        'fontawesome' => array(
            'styles' => array( 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css' )
        )
    );

    foreach ($extras as $lib => $resources) {
        if (isset($config[$lib])) {
            if (isset($resources['styles'])) {
                foreach ($resources['styles'] as $style) {
                    echo "    ";
                    echo '<link rel="stylesheet" href="'.$style.'"/>';
                    echo "\n";
                }
            }

            if (isset($resources['scripts'])) {
                foreach ($resources['scripts'] as $script) {
                    echo "\t";
                    echo '<script src="'.$script.'"></script>';
                    echo "\n";
                }
            }
        }
    }
}
?>
