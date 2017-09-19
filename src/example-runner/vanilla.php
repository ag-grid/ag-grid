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
<html>
<head>
<?php if (!$preview) { ?>
    <style> html, body { margin: 0; padding: 0; } </style>
<?php } ?>
<?php renderExampleExtras($_GET) ?>
<?= globalAgGridScript(isset($_GET["enterprise"])) ?>
<?php renderStyles($styles); ?>
</head>
<body>

<?php
include path_combine('..', $exampleSection, $exampleDir, 'index.html');

echo "\n";

foreach ($scripts as $script) {
    echo '<script src="'.$script.'"></script>' . "\n";
}
?>
</body>
</html>
