<?php

/* used by both grid and charts examples - vanilla examples */
function globalAgGridScript($enterprise = false)
{
    function getLocalCssIfApplicable()
    {
        $result = '';
        if (AG_GRID_CSS_PATHS) {
            foreach (AG_GRID_CSS_PATHS as $cssLink) {
                $result = $result . "    <link rel=\"stylesheet\" href=\"$cssLink\">\n";
            }
        }
        return $result;
    }

    $localCss = getLocalCssIfApplicable();
    echo $localCss; // this is important

    $path = $enterprise ? AG_GRID_ENTERPRISE_SCRIPT_PATH : AG_GRID_SCRIPT_PATH;
    return "    <script src=\"$path\"></script>";
}

/* used by both grid and charts examples - vanilla examples */
function globalAgChartsScript()
{
    $path = AG_CHARTS_SCRIPT_PATH;
    return "    <script src=\"$path\"></script>";
}

/* general utilities */
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

function getDirContents($dir, &$results = array(), $prefix = "")
{
    $files = scandir($dir);

    usort($files, 'moveIndexFirst');

    foreach ($files as $key => $value) {
        $path = realpath($dir . "/" . $value);

        if (substr($value, 0, 1) == ".") {
            continue;
        }

        if (!is_dir($path)) {
            $results[] = $prefix . $value;
        } else if ($value != "." && $value != "..") {
            getDirContents($path, $results, $prefix . $value . "/");
        }
    }

    return $results;
}

function toQueryString($key, $value)
{
    $value = urlencode($value);
    return "$key=$value";
}

function path_combine(...$parts)
{
    return join("/", $parts);
}

function filterByExt($files, $root, $plunkerView, $ext)
{
    $matching = array();
    foreach ($files as $file) {
        $path = path_combine($root, $file);
        $info = pathinfo($path);

        if ($info['extension'] == $ext) {
            $matching[] = $plunkerView ? $file : $path;
        }
    }

    return $matching;
}

?>
