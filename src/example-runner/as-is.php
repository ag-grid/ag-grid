<?php
include 'utils.php';

$exampleDir = basename($_GET['example']);
$exampleSection = basename($_GET['section']);

$path = path_combine('..', $exampleSection, $exampleDir);

?>
<?php
include path_combine($path, 'index.html');
?>
