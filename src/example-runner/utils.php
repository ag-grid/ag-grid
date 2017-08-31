<?php
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


function example($title, $dir, $type='') {
    $fileList = htmlspecialchars(json_encode(getDirContents($dir)));
    $section = basename(dirname($_SERVER['SCRIPT_NAME']));
    $additional = '';

    if ($type == 'angular') {
        $boilerplatePath = '../example-runner/angular-boilerplate/';
        $additional .= "boilerplate-path=\"'$boilerplatePath'\"";
        $additional .= ' boilerplate-files="' . htmlspecialchars(json_encode(getDirContents($boilerplatePath))) . '"';
    }
    return <<<NG
    <example-runner 
        type="'$type'" 
        name="'$dir'" 
        section="'$section'" 
        title="'$title'" 
        files="$fileList"
        $additional
        >
    </example-runner>
NG;
}
?>
