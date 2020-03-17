<?php
require_once 'example-runner.php';
$example = getExampleInfo('chart', 'vanilla');
?>
<!DOCTYPE html>
<html lang="en">
<head>
<script>var __basePath = '<?= rtrim($example['appLocation'], '/') . '/' ?>';</script>
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
    <?= getStyleTags($example['styles']); ?>
</head>
<body>
    <?php include path_combine($example['sourcePath'], 'index.html'); ?>

    <?= getNonGeneratedScriptTags($example['scripts']); ?>
</body>
</html>