<?php
require_once dirname(__DIR__) . '/config.php';
require_once dirname(__DIR__) . '/example-runner/example-runner.php';

function reactApp($dir, $id, $options = array())
{
    $section = basename(dirname($_SERVER['SCRIPT_NAME']));

    $config = array(
        'name' => $dir,
        'section' => $section,
        'types' => array(),
        'sourcePrefix' => RUNNER_SOURCE_PREFIX,
        'options' => $options
    );

    $config['types'] = array('vanilla', 'angular', 'react', 'vue');

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

    $entry['files'] = getDirContents($dir);

    $entry['boilerplatePath'] = "../react-runner/app-boilerplate";
    $entry['boilerplateFiles'] = getDirContents($entry['boilerplatePath']);

    $entry['resultUrl'] = "../react-runner/react-app.php?$queryString";
    $entry['id'] = $id;

    $config['app'] = $entry;

    $jsonConfig = htmlspecialchars(json_encode($config));

    return <<<NG
    <react-runner config="$jsonConfig"></react-runner>
NG;
}

?>
