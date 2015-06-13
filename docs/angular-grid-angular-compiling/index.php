<?php
$key = "Angular Compiling";
$pageTitle = "AngularJS Data Grid - Angular Compiling";
$pageDescription = "Documentation on how to Angular Compile for Angular AngularJS Data Grid";
$pageKeyboards = "AngularJS Angular Data Grid Angular Compiling";
include '../documentation_header.php';
?>

<div>
    <h2>Angular Compiling</h2>

    <p/>
    Angular is great. The author of Angular Grid uses Angular for his large projects.
    <p/>
    However the author of Angular Grid is of the opinion that not everything should be
    built in Angular. Angular does come with a disadvantage, it can slow things down.
    To maximise the performance of Angular Grid, it does not use Angular to render it's
    rows. Instead it manipulates the DOM in Javascript. This gives a very fast grid
    experience.
    <p/>
    But then again, maybe you are not worried about performance. Maybe you are not displaying
    that many rows and columns. And maybe you want to provide your own cell renderers
    and use Angular here. For whatever reason, it is possible to turn Angular on.
    <p/>
    When Angular is turned on in Angular Grid, every time a row is inserted, a new child
    Angular Scope is created for that row. This scope get's the row attached to it
    so it's available to any Angular logic inside the cell.
    <p/>
    Each cell within the row does not get a new child scope. So if placing item inside the
    child scope for the row, be aware that it is shared across all cells for that row.
    If you want a cell to have it's own private scope, consider using a directive
    for the renderer that will introduce a new scope.
    <p/>

    <h4>Example using Angular Compile</h4>

    Angular compiling is turned on by setting the grid options attribute angularCompile to true.
    <p/>
    Below then uses three columns rendered using customer Angular renderers.
    <p/>
    <b>Athlete:</b> Uses simple binding to display text.<br/>
    <b>Age:</b> Uses simple binding to display a button, with a button click event using ng-click.<br/>
    <b>Country:</b> Uses a custom Angular directive to display the country.<br/>
    <p/>

    <show-example example="example1"></show-example>

    <note>
        When scrolling the example above up and down, the cells rendered using Angular are blank
        initially, and filled in during the next Angular digest cycle. This behaviour the author
        has observed in other Angular Grid implementations. This is another reason why the author
        prefers non-Angular rendering for large grids.
    </note>
</div>

<?php include '../documentation_footer.php';?>
