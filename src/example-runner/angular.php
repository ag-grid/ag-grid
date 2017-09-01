<?php
include 'utils.php';

$example = getExampleInfo('angular');
?>
<html>
<head>
    <title>Angular 2 ag-Grid starter</title>
    <script>document.write('<base href="' + document.location + '" />');</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

<?php if (!$example['preview']) { ?>
    <style> html, body { margin: 0; padding: 0; } </style>
<?php } ?>

<?php
renderStyles($example['styles']);
?>

    <!-- Polyfills -->
    <script src="https://unpkg.com/core-js/client/shim.min.js"></script>
    <script src="https://unpkg.com/zone.js@0.7.4?main=browser"></script>
    <script src="https://unpkg.com/systemjs@0.19.39/dist/system.src.js"></script>

    <script>
        var appLocation = '<?= $example['appLocation'] ?>';
        var boilerplatePath = '<?= $example['boilerplatePath'] ?>';
        var agGridScriptPath = '<?= $example['agGridScriptPath'] ?>';
    </script>

    <script src="<?=$example['boilerplatePath']?>systemjs.config.js"></script>

    <script>
    System.import('<?=$example['boilerplatePath']?>main.ts').catch(function(err){ console.error(err); });
    </script>
</head>
<body>
    <my-app>Loading...</my-app>
</body>
</html>
