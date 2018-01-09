<?php
include 'utils.php';

$exampleDir = basename($_GET['example']);
$exampleSection = basename($_GET['section']);
$usePath = $_GET['usePath'];

$path = path_combine('..', $exampleSection, $exampleDir);

if($usePath) {
?>
<div style="width: 100%; height: 100%">
    <iframe src="<?= path_combine($path, $usePath) ?>" width="100%" height="100%" frameborder="0">
    </iframe>
</div>
<?php
}
else {
    include path_combine($path, 'index.html');
}
?>

