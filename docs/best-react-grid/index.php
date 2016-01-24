<?php
$key = "Getting Started React";
$pageTitle = "Best React Grid";
$pageDescription = "Shows and example of a data grid for using with React.";
$pageKeyboards = "React Grid";
include '../documentation_header.php';
?>

<div>

    <h2>Getting Started - React</h2>

    + The child component (cell renderers etc) will be detached from the React virtual dom.
      This means that they will not be rerendered automatically when a state change is
      detected. Need to provide a method that will render children when this happens
      (done with React.Component.forceUpdate method).

</div>

<?php include '../documentation_footer.php';?>
