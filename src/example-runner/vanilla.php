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

    <!-- Optional references -->
    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">
    <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.css"/>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.1/jquery.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.js"></script>

    <!-- font awesome -->
    <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">

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
