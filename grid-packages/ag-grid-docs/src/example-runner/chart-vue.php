<?php
include 'example-runner.php';
$example = getExampleInfo('chart', 'vue');
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
</head>
<body>
    <div id="app" style="height: 100%">
        <my-component>Loading Vue example&hellip;</my-component>
    </div>

    <script>
        var appLocation = '<?= $example['appLocation'] ?>';
        var boilerplatePath = '<?= $example['boilerplatePath'] ?>';
        var systemJsMap = <?= json_encode($chartSystemJsMap, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) ?>;
<?php if (!empty($chartSystemJsCommunityPaths)) { ?>
        var systemJsPaths = <?= json_encode($chartSystemJsCommunityPaths, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) ?>;
<?php } ?>
    </script>

    <script src="https://unpkg.com/systemjs@0.19.39/dist/system.src.js"></script>
    <script src="<?= $example['boilerplatePath'] ?>systemjs.config.js"></script>
    <?= getNonGeneratedScriptTags($example['scripts'], true); ?>
    <script>
        System.import('<?=$example['appLocation']?>main.js').catch(function (err) {
            console.error(err);
        })
    </script>
</body>
</html>
