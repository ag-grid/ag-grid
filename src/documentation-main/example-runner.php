<?php

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
        
        if(!is_dir($path)) {
            $results[] = $prefix . $value;
        } else if($value != "." && $value != "..") {
            getDirContents($path, $results, $prefix.$value.DIRECTORY_SEPARATOR);
        }
    }

    return $results;
}

function example($title, $dir) {
    $fileList = htmlspecialchars(json_encode(getDirContents($dir)));
    $section = basename(dirname($_SERVER['SCRIPT_NAME']));
    return <<<NG
    <example-runner name="'$dir'" section="'$section'" title="'$title'" files="$fileList"></example-runner>
NG;
}
?>
