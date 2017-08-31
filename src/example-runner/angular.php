<?php
include 'utils.php';

$exampleDir = basename($_GET['example']);
$exampleSection = basename($_GET['section']);
$appRoot = path_combine('..', $exampleSection, $exampleDir);
$files = getDirContents($appRoot);
array_shift($files); // drop index.php
$styles = array();
$preview = isset($_GET['preview']);

if ($preview) {
    $boilerplatePath = "";
    $appLocation = "";
} else {
    $boilerplatePath = "angular-boilerplate/";
    $appLocation = $appRoot . "/";
}

foreach ($files as $file) {
    $path = path_combine($appRoot, $file);
    $info = pathinfo($path);
    switch ($info['extension']) {
    case 'css':
        $styles[] = $preview ? $file : $path;
        break;
    }
}

$agGridScriptPath = "http" . ($_SERVER['HTTPS'] ? 's' : '') . "://{$_SERVER['HTTP_HOST']}/dist/ag-grid/ag-grid.js?ignore=notused50";
?>
<html>
<head>
    <title>Angular 2 ag-Grid starter</title>
    <script>document.write('<base href="' + document.location + '" />');</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

<?php if (!$preview) { ?>
    <style> html, body { margin: 0; padding: 0; } </style>
<?php } ?>

<?php
foreach ($styles as $style) {
    echo '    <link rel="stylesheet" href="'.$style.'">' . "\n";
}
?>

    <!-- Polyfills -->
    <script src="https://unpkg.com/core-js/client/shim.min.js"></script>
    <script src="https://unpkg.com/zone.js@0.7.4?main=browser"></script>
    <script src="https://unpkg.com/systemjs@0.19.39/dist/system.src.js"></script>

    <script>
        var appLocation = '<?= $appLocation ?>';
        var boilerplatePath = '<?= $boilerplatePath ?>';
        var agGridScriptPath = '<?= $agGridScriptPath ?>';
    </script>

    <script src="<?=$boilerplatePath?>systemjs.config.js"></script>

    <script>
    System.import('<?=$boilerplatePath?>main.ts').catch(function(err){ console.error(err); });
    </script>
</head>
<body>
    <my-app>Loading...</my-app>
</body>
</html>
