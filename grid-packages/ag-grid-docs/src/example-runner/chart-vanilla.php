<?php
require_once 'example-runner.php';

$exampleDir = basename($_GET['example']);
$exampleSection = basename($_GET['section']);
$multi = isset($_GET['multi']);
$generated = isset($_GET['generated']);
$plunkerView = isset($_GET['plunkerView']);

if ($multi) {
    $path = path_combine('..', $exampleSection, $exampleDir, 'vanilla');
} else if ($generated) {
    $path = path_combine('..', $exampleSection, $exampleDir, '_gen', 'vanilla');
} else {
    $path = path_combine('..', $exampleSection, $exampleDir);
}

$files = getDirContents($path);
$scripts = getScripts($files, $path, $plunkerView);
?>
<!DOCTYPE html>
<html lang="en">
<head>
<script>var __basePath = '<?= $plunkerView ? "" : rtrim($path, '/') . '/'; ?>';</script>
    <style media="only screen">
        html, body {
            height: 100%;
            width: 100%;
            margin: 0;
            box-sizing: border-box;
            -webkit-overflow-scrolling: touch;
        }

        html {
            position: absolute;
            top: 0;
            left: 0;
            padding: 0;
            overflow: auto;
        }

        body {
            padding: 1rem;
            overflow: auto;
        }
    </style>
    <?= getGlobalAgChartsScriptTag() ?>
</head>
<body>
    <?php include path_combine($path, 'index.html'); ?>

    <?= getNonGeneratedScriptTags($scripts); ?>
</body>
</html>