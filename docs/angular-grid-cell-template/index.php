<?php
$key = "Cell Templates";
$pageTitle = "AngularJS Angular Grid Cell Templates";
$pageDescription = "Angular Grid allows you to specify cell templates. Cell templates allow custom rendering of the cell given a provided template. This pages describes how to use them.";
$pageKeyboards = "AngularJS Angular Grid Cell Templates";
include '../documentation_header.php';
?>

<div>

    <h2>Cell Templates</h2>

    <p>
        Templates allow you to specify templates to use to render your cells. This is used when you are
        using dynamic HTML such as that provided by AngularJS (otherwise each cell in the column
        would look the same!). If you are not using dynamic HTML (such as AngularJS) then don't use cell
        templates, they are not much use.
    </p>

    <p>
        Cell templates are specified in the column definition by providing a template as a
        string or a templateUrl to load the template from the server.
    </p>

    <p>
        If using templateUrl, then the html is cached. The server is only hit once per template and
        it is reused.
    </p>

    <h3>Cell Template Example</h3>

    <p>
        The example below uses cell templates for the first three columns.
        <ul>
        <li><b>Col 1 - </b> The first column uses a static template. Pretty pointless as you can't change
            the content between rows.
        </li>
        <li><b>Col 2 - </b> The second column uses an inline template. AngularJS is then used to fetch
            the content from the scope via ng-bind.
        </li>
        <li><b>Col 3 - </b> The third column is similar to the second, with the difference that it loads
            the template from the server.
        </li>
        </ul>
    </p>

    <note>
        In the example, as you scroll up and down, the redraw on
        the AngularJS columns has a lag. This is waiting for the AngularJS digest cycle to kick in
        to populate the values into these rows.
        If you like this effect, then check out <a href="http://ui-grid.info/">ui-grid</a>,
        where all cells are rendered in this fashion.
    </note>

    <show-example example="example1"></show-example>
</div>

<?php include '../documentation_footer.php';?>
