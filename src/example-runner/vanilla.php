<?php
include 'utils.php';

$exampleDir = basename($_GET['example']);
$exampleSection = basename($_GET['section']);
$multi = isset($_GET['multi']);
$generated = isset($_GET['generated']);
$preview = isset($_GET['preview']);
$gridDefaults = getGridSettings();

if ($multi) {
    $path = path_combine('..', $exampleSection, $exampleDir, 'vanilla');
} else if ($generated) {
    $path = path_combine('..', $exampleSection, $exampleDir, '_gen', 'vanilla');
} else {
    $path = path_combine('..', $exampleSection, $exampleDir);
}

$files = getDirContents($path);

$scripts = array();
$styles = array();

foreach ($files as $file) {
    $filePath = path_combine($path, $file);
    $info = pathinfo($filePath);
    switch ($info['extension']) {
    case 'js':
        $scripts[] = $preview ? $file : $filePath;
        break;
    case 'css':
        $styles[] = $preview ? $file : $filePath;
        break;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<?php if ($preview) { ?>
<script> var __basePath = ''; </script>
<?php } else { ?>
<script> var __basePath = "<?php echo $path?>/"</script>
<?php } ?>
<style> html, body { margin: 0; padding: 0; height: 100%; } </style>
<?php renderExampleExtras($_GET) ?>
<?= globalAgGridScript(isset($_GET["enterprise"])) ?>
<?php renderStyles($styles); ?>
</head>
<body>

<?php
include path_combine($path, 'index.html');
echo "\n";
foreach ($scripts as $script) {
    if ($script !== 'worker.js') {
        echo '    <script src="'.$script.'"></script>' . "\n";
    }
}
?>
</body>
</html>
