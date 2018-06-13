<?php
include 'utils.php';
$example = getExampleInfo('angular');
$generated = isset($_GET['generated']);
?>
<!DOCTYPE html>
 <html lang="en">
<head>
    <title>Angular 2 ag-Grid starter</title>
    <script>document.write('<base href="' + document.location + '" />');</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <style> html, body { margin: 0; padding: 0; height: 100%; } </style>
<?php renderExampleExtras($_GET); ?>
<?php renderStyles($example['styles']); ?>

<?php renderNonGeneratedScripts($example['scripts']); ?>

    <!-- Polyfills -->
    <script src="https://unpkg.com/core-js/client/shim.min.js"></script>
    <script src="https://unpkg.com/zone.js@0.8.17?main=browser"></script>
    <script src="https://unpkg.com/systemjs@0.19.39/dist/system.src.js"></script>

    <script>
        var appLocation = '<?= $example["appLocation"] ?>';
        var boilerplatePath = '<?= $example["boilerplatePath"] ?>';
        var systemJsMap = <?= json_encode($systemJsMap) ?>;
    </script>

    <script src="<?=$example['boilerplatePath']?>systemjs.config.js"></script>

    <script>
    System.import('<?=$example['boilerplatePath']?>main.ts').catch(function(err){ console.error(err); });
    </script>

</head>
<body>
    <my-app>Loading ag-Grid example&hellip;</my-app>
</body>
</html>
