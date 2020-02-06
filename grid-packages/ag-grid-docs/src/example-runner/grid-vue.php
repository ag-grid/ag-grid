<?php
require_once 'example-runner.php';
$example = getExampleInfo('grid', 'vue');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Vue example</title>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
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
    <?php renderExampleExtras($_GET) ?>
    <?php renderStyles($example['styles']); ?>
</head>
<body>
<div id="app" style="height: 100%">
    <my-component>Loading Vue example&hellip;</my-component>
</div>

<script>
    var appLocation = '<?= $example['appLocation'] ?>';
    var boilerplatePath = '<?= $example['boilerplatePath'] ?>';
    var systemJsMap = <?= json_encode($gridSystemJsMap, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) ?>;
    var systemJsPaths = <?= json_encode($example['gridSettings']['enterprise'] ? $gridSystemJsEnterprisePaths : $gridSystemJsCommunityPaths, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) ?>;
</script>

<script src="https://unpkg.com/systemjs@0.19.39/dist/system.src.js"></script>
<script src="<?= $example['boilerplatePath'] ?>systemjs.config.js"></script>

<script>
    System.import('<?=$example['appLocation']?>main.js').catch(function (err) {
        console.error(err);
    })
</script>
</body>
</html>
