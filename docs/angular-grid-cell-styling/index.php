<?php
$key = "Cell Styling";
$pageTitle = "Angular Grid Cell Styling";
$pageDescription = "You can change the CSS style in Angular Grid. This is done by providing style and class callbacks in the column definition.";
$pageKeyboards = "Angular Grid Cell Styling CSS";
include '../documentation_header.php';
?>

<div>

    <h2>Cell Styling</h2>

    <p>
        Cell customisation is done a the column level via the column definition. You can mix and match any
        of the following mechanisms:
        <ul>
            <li><b>Cell Class:</b> Providing a CSS class for the cells.</li>
            <li><b>Cell Style:</b> Providing a CSS style for the cells.</li>
            <li><b>Cell Renderer:</b> Take complete control and provide how the cell should look.</li>
        </ul>
    </p>

    <p>
        This section discusses the first two, setting style via cellClass and cellStyle attributes of
        the column definition.
    </p>

    <h2>cellClass</h2>

    <p>
        Provides a class for the cells in this column. Can be a string (a class), array of strings
        (array of classes), or a function (that returns a string or an array of strings).

    <pre><code>// return same class for each row
var colDef1 = {
    name: 'Static Class',
    field' 'field1',
    cellClass: 'my-class'
}
// return same array of classes for each row
var colDef2 = {
    name: 'Static Array of Classes',
    field' 'field2',
    cellClass: ['my-class1','my-class2']
}
// return class based on function
var colDef3 = {
    name: 'Function Returns String',
    field' 'field3',
    cellClass: function(params) { return (params.value==='something'?'my-class-1':'my-class-2'); }
}
// return array of classes based on function
var colDef4 = {
    name: 'Function Returns Array',
    field' 'field4',
    cellClass: function(params) { return ['my-class-1','my-class-2']; }
}
    </code></pre>

    </p>

    <h2>cellStyle</h2>

    <p>
        Used to provide CSS styles directly (not using a class) to the cell. Can be either an object
        of CSS styles, or a function returning an object of CSS styles.
    </p>


    <pre><code>// return same style for each row
var colDef = {
    name: 'Static Styles',
    field' 'field1',
    cellStyle: {color: red, background-color: green}
}
// return different styles for each row
var colDef = {
    name: 'Dynamic Styles',
    field' 'field2',
    cellStyle: function(params) {
        if (params.value=='Police') {
            //mark police cells as red
            return {color: red, background-color: green};
        } else {
            return null;
        }
    }
}
    </code></pre>

    <h4>Cell Style & Cell Class Params</h4>

    Both cellClass and cellStyle functions take a params object with the following values:<br/>

    value: The value to be rendered.<br/>
    data: The row (from the rowData array, where value was taken) been rendered.<br/>
    colDef: The colDef been rendered.<br/>
    $scope: If compiling to Angular, is the row's child scope, otherwise null.<br/>

</div>

<?php include '../documentation_footer.php';?>
