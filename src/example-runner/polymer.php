<?php
include 'utils.php';

$exampleDir = basename($_GET['example']);
$exampleSection = basename($_GET['section']);
$files = getDirContents(path_combine('..', $exampleSection, $exampleDir));
$scripts = array();
$styles = array();
$preview = isset($_GET['preview']);

foreach ($files as $file) {
    $path = path_combine('..', $exampleSection, $exampleDir, $file);
    $info = pathinfo($path);
    switch ($info['extension']) {
    case 'js':
        $scripts[] = $preview ? $file : $path;
        break;
    case 'css':
        $styles[] = $preview ? $file : $path;
        break;
    }
}
?>
<html lang="en">
    <head>
    <base href="<?= POLYMER_BASE_HREF_PREFIX ."${exampleSection}/$exampleDir/" ?>" />
<?php if (!$preview) { ?>
    <style> html, body { margin: 0; padding: 0; } </style>
<?php } ?>
<?php renderExampleExtras($_GET) ?>
    <!-- polymer polyfill - must be before any wc related javascript is executed -->
    <script src="//cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/1.0.11/webcomponents-loader.js"></script>
    <link rel="import"  href="<?= POLYMER_BASE_HREF_PREFIX ?>framework-examples/polymer-examples/bower_components/polymer/polymer.html">

<?= globalAgGridScript(isset($_GET["enterprise"])) ?>


    <!-- the ag-grid-polymer component-->
    <link rel="import" href="https://rawgit.com/ag-grid/ag-grid-polymer/master/ag-grid-polymer.html">
    </head>
<body>

<?php include path_combine('..', $exampleSection, $exampleDir, 'index.html'); ?>
</body>
</html>
