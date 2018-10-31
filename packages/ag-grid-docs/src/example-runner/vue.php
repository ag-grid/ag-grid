<?php
include 'utils.php';
$example = getExampleInfo('vue');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>ag-Grid Vue Example</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style> html, body { margin: 0; padding: 0; height: 100%; } </style>
<?php renderExampleExtras($_GET) ?>
<?php renderStyles($example['styles']); ?>
<?php //renderNonGeneratedScripts($example['scripts'], TRUE); ?>
</head>
<body>
    <div id="app" style="height: 100%">
        <my-component></my-component>
    </div>
    
    <script>
        var appLocation = '<?= $example['appLocation'] ?>';
        var boilerplatePath = '<?= $example['boilerplatePath'] ?>';
        var systemJsMap = <?= json_encode($systemJsMap) ?>
    </script>

    <script src="https://unpkg.com/systemjs@0.19.39/dist/system.src.js"></script>
    <script src="<?=$example['boilerplatePath']?>systemjs.config.js"></script>

    <script>
      System.import('<?=$example['appLocation']?>main.js').catch( function(err) { console.error(err); })
    </script>
</body>
</html>
