<?php
include 'utils.php';
$example = getExampleInfo('react');
$generated = isset($_GET['generated']);
$includeBlueprint = isset($_GET['includeBlueprint']);
if ($generated) { 
    echo "<!DOCTYPE html>\n";
};
?>
<html lang="en">
<head>
    <title>ag-Grid React Example</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style> html, body, #root { margin: 0; padding: 0; height: 100%; } </style>
<?php renderExampleExtras($_GET) ?>
<?php renderStyles($includeBlueprint ? array_merge($example['styles'], array(
    "https://unpkg.com/@blueprintjs/core@^3.0.0/lib/css/blueprint.css",
    "https://unpkg.com/@blueprintjs/icons@^3.0.0/lib/css/blueprint-icons.css",
    "https://unpkg.com/react-day-picker@7.2.4/lib/style.css"
)) : $example['styles']); ?>
<?php renderNonGeneratedScripts($example['scripts']); ?>
</head>
<body>
    <div id="root">Loading ag-Grid React example&hellip;</div>
    
    <script>
        var appLocation = '<?= $example['appLocation'] ?>';
        var boilerplatePath = '<?= $example['boilerplatePath'] ?>';
        var systemJsMap = <?= json_encode($includeBlueprint ? $systemJsMap = array_merge($systemJsMap, array(
                "popper" => "https://unpkg.com/popper@1.14.6/dist/umd/popper.js",
                "react-popper" => "https://unpkg.com/react-popper@1.3.0/dist/index.umd.min.js",
                "react-transition-group" => "https://unpkg.com/react-transition-group@2.2.1/dist/react-transition-group.min.js",
                "react-day-picker" => "https://unpkg.com/react-day-picker@7.2.4/lib/daypicker.min.js",
                "tslib" => "https://unpkg.com/tslib@1.9.3/tslib.js",
                "classnames" => "https://unpkg.com/classnames@2.2.6/index.js",
                "dom4" => "https://unpkg.com/dom4@2.1.4/build/dom4.js",
                "@blueprintjs/core" => "https://unpkg.com/@blueprintjs/core@^3.0.0/dist/core.bundle.js",
                "@blueprintjs/icons" => "https://unpkg.com/@blueprintjs/icons@3.3.0/dist/icons.bundle.js",
                "@blueprintjs/datetime" => "https://unpkg.com/@blueprintjs/datetime@3.4.0/dist/datetime.bundle.js"
            )) : $systemJsMap); 
        ?>
    </script>

    <script src="https://unpkg.com/systemjs@0.19.39/dist/system.src.js"></script>
    <script src="<?=$example['boilerplatePath']?>systemjs.config.js"></script>

    <script>
      System.import('<?=$example['appLocation']?>index.jsx').catch( function(err) { console.error(err); })
    </script>
</body>
</html>
