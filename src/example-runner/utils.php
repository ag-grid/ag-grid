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
    $prefix =  "//$host/$archiveSegment/dist";
    define('RUNNER_SOURCE_PREFIX', "/$archiveSegment");
    define('POLYMER_BASE_HREF_PREFIX', "//$host/$archiveSegment/");
} else {
    $prefix =  "//$host/dev";
    define('RUNNER_SOURCE_PREFIX', "");
    define('POLYMER_BASE_HREF_PREFIX', "//$host/");
}

if (USE_LOCAL) {

    define(AG_GRID_SCRIPT_PATH, "$prefix/ag-grid/dist/ag-grid.js");
    define(AG_GRID_ENTERPRISE_SCRIPT_PATH, "$prefix/ag-grid-enterprise-bundle/ag-grid-enterprise.js");

    $systemJsMap = array(
        "ag-grid" =>                       "$prefix/ag-grid/dist/ag-grid.js",
        "ag-grid/main" =>                  "$prefix/ag-grid/dist/ag-grid.js",
        "ag-grid-enterprise" =>            "$prefix/ag-grid-enterprise/main.js",
        "ag-grid-react" =>                 "$prefix/ag-grid-react",
        "ag-grid-angular" =>               "$prefix/ag-grid-angular"
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
$path = $enteprise ? AG_GRID_ENTERPRISE_SCRIPT_PATH : AG_GRID_SCRIPT_PATH;
    return <<<SCR
    <script src="$path"></script>
SCR;
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

function moveVanillaFirst($a, $b) {
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
    foreach($files as $file) {
        if(substr($file, 0, 1) == ".") {
            continue;
        }
        if (is_dir(realpath($dir . "/" . $file))) {
            $types[] = $file;
        }
    }

    usort($types, 'moveVanillaFirst');

    return $types;
}

function example($title, $dir, $type='vanilla', $options = array()) {
    $section = basename(dirname($_SERVER['SCRIPT_NAME']));
    $multi = $type === 'multi';

    $config = array(
        'type' => $type,
        'name' => $dir, 
        'section' => $section,
        'types' => array(),
        'title' => $title,
        'sourcePrefix' => RUNNER_SOURCE_PREFIX,
        'options' => json_encode($options) 
    );

    if ($multi) {
        $types = getTypes($dir);
    } else {
        $types = [ $type ];
    }

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

    foreach ($types as $theType) {
        $entry = array();
        if ($multi) {
            $entry['files'] = getDirContents($dir . "/" . $theType); 
        }  else {
            $entry['files'] = getDirContents($dir); 
        }

        if ($theType != "vanilla" && $theType != "polymer") {
            $entry['boilerplatePath'] =  "../example-runner/$theType-boilerplate/";
            $entry['boilerplateFiles'] = getDirContents($entry['boilerplatePath']);
        }
        
        $entry['resultUrl'] = "../example-runner/$theType.php?$queryString" . ($multi ? '&multi=1' : '');

        $config['types'][$theType] = $entry;
    }

    $jsonConfig = htmlspecialchars(json_encode($config));

    return <<<NG
    <example-runner config="$jsonConfig"></example-runner>
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

    // bootstrap script wants jQuery
    if ($config['bootstrap']) {
        $config['jquery'] = 1;
    }

    // jQuery UI wants jQuery
    if ($config['jqueryui']) {
        $config['jquery'] = 1;
    }

    $extras = array(
        'jquery' => array(
            'scripts' => array( 'https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.1/jquery.min.js' )
        ),
        'jqueryui' => array(
            'scripts' => array( 'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js' ),
            'styles' => array ( 'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css' )
        ),
        'rxjs' => array(
            'scripts' => array( 'https://cdnjs.cloudflare.com/ajax/libs/rxjs/5.4.0/Rx.min.js' )
        ),
        'lodash' => array(
            'scripts' => array( 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js' )
        ),
        'd3' => array(
            'scripts' => array( 'https://d3js.org/d3.v4.min.js' )
        ),
        'sparkline' => array(
            'scripts' => array( 'https://cdnjs.cloudflare.com/ajax/libs/jquery-sparklines/2.1.2/jquery.sparkline.min.js' )
        ),
        'bootstrap' => array(
            'scripts' => array( 'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js' ),
            'styles' => array(
                'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css' ,
                'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap-theme.min.css'
            )
        ),
        'roboto' => array(
            'styles' => array( 
                'https://fonts.googleapis.com/css?family=Roboto' 
            )
        ),
        'fontawesome' => array(
            'styles' => array( 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css' )
        ),
        'angularjs1' => array(
            'scripts' => array(
                'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular.min.js'
            )
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
