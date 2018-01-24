<?php
$pageTitle = "ag-Grid Responsiveness";
$pageDescription = "ag-Grid Responsive Web Design";
$pageKeyboards = "ag-Grid Responsive Web Design";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Responsive Web Design</h1>

<p class="lead">
    We can dynamically react to screen changes by making use of the grid API features. In this section we describe
    a few recommended approaches to resize the grid and show/hide columns based on screen size changes.
</p>

<note>These recipes below are suggestions - as the grid can be placed & positioned in your application in many ways and
with many frameworks the suggestions below may not work out of the box in your particular application, but they should serve
to help point you in the right direction.</note>

<h2>Dynamic Resizing with Horizontal Scroll</h2>

<p>
    The quickest way to achieve a responsive grid is to set the grid's containing div to a percentage. With this
    simple change the grid will automatically resize based on the div size and columns that can't fit in the viewport
    will simply be hidden and available to the right via the scrollbar.
</p>

<?= example('Dynamic horizontal resizing with scroll', 'example', 'generated') ?>

<h2>Dynamic Resizing without Horizontal Scroll</h2>

<p>Sometimes you want to have columns that don't fit in the current viewport to simply be hidden altogether with no
horizontal scrollbar.</p>

<p>To achieve this determine the width of the grid and work out how many columns could fit in that space, hiding any that
don't fit, constantly updating based on the <code>gridSizeChanged</code> event firing, like the next example shows.</p>

<p>This example is best seen when opened in a new tab - then change the horizontal size of the browser and watch as
columns hide/show based on the current grid size.</p>

<?= example('Dynamic horizontal resizing without scroll', 'example1', 'generated') ?>

<h2>Dynamic Vertical Resizing</h2>

<p>Sometimes the vertical height of the grid is greater than the number of rows you have it in.  You can dynamically
set the row heights to fill the available height as the following example shows:</p>

<?= example('Dynamic vertical resizing', 'example2', 'generated') ?>

<?php include '../documentation-main/documentation_footer.php';?>
