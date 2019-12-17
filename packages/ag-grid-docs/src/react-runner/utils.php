<?php
include dirname(__FILE__) . '/../config.php';

function getReactExampleInfo($boilerplatePrefix)
{
    $preview = isset($_GET['preview']);

    $exampleDir = basename($_GET['example']);
    $exampleSection = basename($_GET['section']);

    $appRoot = path_combine('..', $exampleSection, $exampleDir);

    $files = getDirContents($appRoot);

    $styles = getStyles($files, $appRoot, $preview);
    $scripts = getScripts($files, $appRoot, $preview);
    $documents = getDocuments($files, $appRoot, $preview);

    $boilerplatePath = "$boilerplatePrefix-boilerplate/";
    $appLocation = $appRoot . "/";

    return array(
        "preview" => $preview,
        "boilerplatePath" => $boilerplatePath,
        "appLocation" => $appLocation,
        "styles" => $styles,
        "scripts" => $scripts,
        "documents" => $documents
    );
}

function reactApp($dir, $id, $options = array())
{
    $options['skipDirs'] = $options['skipDirs'] ? $options['skipDirs'] : array();

    $section = basename(dirname($_SERVER['SCRIPT_NAME']));

    $config = array(
        'name' => $dir,
        'section' => $section,
        'types' => array(),
        'sourcePrefix' => RUNNER_SOURCE_PREFIX,
        'options' => $options
    );

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

    $queryString = join("&", array_map('toQueryString', array_keys($query), $query));

    $entry['files'] = getDirContents($dir, $options['skipDirs']);

    $entry['boilerplatePath'] = "../react-runner/react-boilerplate";
    $entry['boilerplateFiles'] = getDirContents($entry['boilerplatePath']);

    $entry['resultUrl'] = "../react-runner/react.php?$queryString";
    $entry['id'] = $id;

    $config['app'] = $entry;

    $jsonConfig = htmlspecialchars(json_encode($config));

    return <<<NG
    <react-runner config="$jsonConfig"></react-runner>
NG;
}

?>
