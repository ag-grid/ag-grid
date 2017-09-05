<?php
define('AG_SCRIPT_PATH', "http" . ($_SERVER['HTTPS'] ? 's' : '') . "://{$_SERVER['HTTP_HOST']}/dist/ag-grid/ag-grid.js?ignore=notused50");
define('AG_ENTERPRISE_SCRIPT_PATH', "http" . ($_SERVER['HTTPS'] ? 's' : '') . "://{$_SERVER['HTTP_HOST']}/dist/ag-grid-enterprise/ag-grid-enterprise.js?ignore=notused50");
function path_combine(...$parts) {
    return join(DIRECTORY_SEPARATOR, $parts);
}

function moveIndexFirst($a, $b) {
    if ($a == "index.html") {
        return -1;
    } else {
        return strcmp($a, $b);
    }

}

function getDirContents($dir, &$results = array(), $prefix = ""){
    $files = scandir($dir);
    usort($files, 'moveIndexFirst');

    foreach($files as $key => $value){
        $path = realpath($dir.DIRECTORY_SEPARATOR.$value);
        
        if (substr($value, 0, 1) == ".") {
            continue;
        }

        if(!is_dir($path)) {
            $results[] = $prefix . $value;
        } else if($value != "." && $value != "..") {
            getDirContents($path, $results, $prefix.$value.DIRECTORY_SEPARATOR);
        }
    }

    return $results;
}

function getBoilerplateConfig($type) {
    if ($type == "vanilla") {
        return "";
    }

    $boilerplatePath = "../example-runner/$type-boilerplate/";
    $files = htmlspecialchars(json_encode(getDirContents($boilerplatePath)));

    return <<<ATTR
    boilerplate-path="'$boilerplatePath'"
    boilerplate-files="$files"
ATTR;
}

function example($title, $dir, $type='vanilla', $options = array()) {
    $fileList = htmlspecialchars(json_encode(getDirContents($dir)));
    $section = basename(dirname($_SERVER['SCRIPT_NAME']));
    $additional = getBoilerplateConfig($type);
    $resultUrl = "../example-runner/$type.php?section=$section&example=$dir";
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
?>
