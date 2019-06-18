<?php
$pageTitle = "ag-Grid - Styling & Appearance: Animation";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Animation. Rows in the grid will Animate into place after the user sorts or filters.";
$pageKeyboards = "Javascript Grid Animation";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Column Animation</h1>

    <p class="lead">
        Column animations happen when you move a column. The default is for animations to
        be turned on. It is recommended that you leave the column move animations on unless
        your target platform (browser and hardware) is to slow to manage the animations.
        To turn OFF column animations, set the grid property <code>suppressColumnMoveAnimation=true</code>.
    </p>

    <img src="./columnAnimation.gif" style="1px solid grey; margin: 20px; margin-bottom: 50px;"/>

    <p>
        The move column animation transitions the columns position only. So when you move a column,
        it animates to the new position. No other attribute apart from position is animated.
    </p>

<?php include '../documentation-main/documentation_footer.php';?>
